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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const { matchId, photoUrl, lat, lng } = await req.json();
    const hasPhoto = !!photoUrl;
    const hasGeo = lat != null && lng != null;
    if (!matchId || (!hasPhoto && !hasGeo)) {
      return new Response(JSON.stringify({ error: "matchId and at least one of photoUrl or lat+lng required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } =
      await authClient.auth.getClaims(token);

    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const authUid = claimsData.claims.sub;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profileId } = await supabase.rpc("get_profile_id", {
      _auth_uid: authUid,
    });

    if (!profileId) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Fetch match
    const { data: match, error: matchErr } = await supabase
      .from("matches")
      .select("*, trips(*), parcels(*)")
      .eq("id", matchId)
      .single();

    if (matchErr || !match) {
      return new Response(JSON.stringify({ error: "Match not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    if (match.trips.traveler_id !== profileId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    if (match.status !== "accepted") {
      return new Response(
        JSON.stringify({ error: "Match must be in accepted state" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Update parcel to pending_confirmation with photo and/or geotag
    const updatePayload: Record<string, any> = { status: "pending_confirmation" };
    if (hasPhoto) updatePayload.photo_url = photoUrl;
    if (hasGeo) {
      updatePayload.delivery_lat = lat;
      updatePayload.delivery_lng = lng;
      updatePayload.delivery_geotagged_at = new Date().toISOString();
    }
    await supabase
      .from("parcels")
      .update(updatePayload)
      .eq("id", match.parcel_id);

    // Notify sender
    if (match.parcels.sender_id) {
      await supabase.from("notifications").insert({
        user_id: match.parcels.sender_id,
        type: "delivery_proof_submitted",
        content: "Your traveler reports the parcel has been delivered. Please confirm arrival.",
        related_match_id: matchId,
      });
    }

    // Notify all admins
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminRoles) {
      for (const admin of adminRoles) {
        // Get admin profile id
        const { data: adminProfileId } = await supabase.rpc("get_profile_id", {
          _auth_uid: admin.user_id,
        });
        if (adminProfileId) {
          await supabase.from("notifications").insert({
            user_id: adminProfileId,
            type: "delivery_pending_approval",
            content: `Delivery proof submitted for parcel ${match.parcels.pickup_location} → ${match.parcels.dropoff_location}. Awaiting approval.`,
            related_match_id: matchId,
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("submit-delivery-proof error:", err);
    try {
      const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await logError(svc, null, "submit_delivery_proof", err?.message || String(err));
    } catch { /* silent */ }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
