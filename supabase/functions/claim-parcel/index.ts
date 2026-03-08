import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logError = async (supabase: any, userId: string | null, action: string, errorMessage: string, context?: Record<string, any>) => {
  try {
    await supabase.from("error_logs").insert({ user_id: userId, action, error_message: errorMessage, context: context ?? null });
  } catch { /* silent */ }
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify user JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authUid = claimsData.claims.sub;

    // Use service role for all DB operations
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Get profile id
    const { data: profileId } = await admin.rpc("get_profile_id", { _auth_uid: authUid });
    if (!profileId) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check traveler is approved
    const { data: travelerProfile } = await admin
      .from("traveler_profiles")
      .select("id, status")
      .eq("profile_id", profileId)
      .single();

    if (!travelerProfile || travelerProfile.status !== "approved") {
      return new Response(
        JSON.stringify({ error: "Traveler not approved" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { parcelId, tripId } = await req.json();
    if (!parcelId) {
      return new Response(JSON.stringify({ error: "parcelId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check parcel is still pending
    const { data: parcel } = await admin
      .from("parcels")
      .select("*")
      .eq("id", parcelId)
      .single();

    if (!parcel) {
      return new Response(JSON.stringify({ error: "Parcel not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (parcel.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Parcel is no longer available" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find or use a trip for matching. If tripId provided, use it. Otherwise find/create one.
    let matchTripId = tripId;

    if (!matchTripId) {
      // Find an active trip by this traveler matching the parcel route
      const { data: matchingTrip } = await admin
        .from("trips")
        .select("id")
        .eq("traveler_id", profileId)
        .eq("status", "active")
        .ilike("origin_city", parcel.pickup_location || "")
        .ilike("destination_city", parcel.dropoff_location || "")
        .limit(1)
        .single();

      if (matchingTrip) {
        matchTripId = matchingTrip.id;
      } else {
        // Create an ad-hoc trip for this claim
        const { data: newTrip, error: tripErr } = await admin
          .from("trips")
          .insert({
            traveler_id: profileId,
            origin_city: parcel.pickup_location || "Unknown",
            destination_city: parcel.dropoff_location || "Unknown",
            travel_date: parcel.pickup_earliest || new Date().toISOString().split("T")[0],
            available_weight_kg: parcel.weight_kg || 10,
            status: "active",
          })
          .select("id")
          .single();

        if (tripErr) throw tripErr;
        matchTripId = newTrip.id;
      }
    }

    // Create match record
    const { error: matchErr } = await admin.from("matches").insert({
      parcel_id: parcelId,
      trip_id: matchTripId,
      status: "accepted",
      accepted_at: new Date().toISOString(),
    });

    if (matchErr) throw matchErr;

    // Update parcel status to matched and assign traveler
    const { error: parcelErr } = await admin
      .from("parcels")
      .update({ status: "matched", traveler_id: profileId })
      .eq("id", parcelId);

    if (parcelErr) throw parcelErr;

    // Notify the sender
    if (parcel.sender_id) {
      const { data: travelerInfo } = await admin
        .from("profiles")
        .select("full_name")
        .eq("id", profileId)
        .single();

      await admin.from("notifications").insert({
        user_id: parcel.sender_id,
        type: "parcel_claimed",
        content: `Your parcel from ${parcel.pickup_location} to ${parcel.dropoff_location} has been claimed by ${travelerInfo?.full_name || "a traveler"}.`,
        related_match_id: null,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("claim-parcel error:", err);
    try {
      const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await logError(svc, null, "claim_parcel", err?.message || String(err));
    } catch { /* silent */ }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
