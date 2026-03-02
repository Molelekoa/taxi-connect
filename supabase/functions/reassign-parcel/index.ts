import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (token !== serviceRoleKey) {
      const authClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: claimsData, error: claimsErr } =
        await authClient.auth.getClaims(token);
      if (claimsErr || !claimsData?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: corsHeaders,
        });
      }
    }

    const { parcelId, newMatchId } = await req.json();
    if (!parcelId || !newMatchId) {
      return new Response(
        JSON.stringify({ error: "parcelId and newMatchId required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the new match and its trip
    const { data: newMatch } = await supabase
      .from("matches")
      .select("*, trips(traveler_id, travel_date)")
      .eq("id", newMatchId)
      .single();

    if (!newMatch) {
      return new Response(JSON.stringify({ error: "New match not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Get old accepted match
    const { data: oldMatch } = await supabase
      .from("matches")
      .select("*, trips(traveler_id)")
      .eq("parcel_id", parcelId)
      .eq("status", "accepted")
      .single();

    if (!oldMatch) {
      return new Response(JSON.stringify({ error: "No existing accepted match" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Get parcel for sender_id
    const { data: parcel } = await supabase
      .from("parcels")
      .select("sender_id")
      .eq("id", parcelId)
      .single();

    // Set old match to reassigned
    await supabase
      .from("matches")
      .update({ status: "reassigned" })
      .eq("id", oldMatch.id);

    // Set new match to accepted
    await supabase
      .from("matches")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", newMatchId);

    // Update parcel's traveler_id
    const newTravelerId = newMatch.trips?.traveler_id;
    if (newTravelerId) {
      await supabase
        .from("parcels")
        .update({ traveler_id: newTravelerId })
        .eq("id", parcelId);
    }

    // Notify old traveler
    const oldTravelerId = oldMatch.trips?.traveler_id;
    if (oldTravelerId) {
      await supabase.from("notifications").insert({
        user_id: oldTravelerId,
        type: "parcel_reassigned",
        content: "A parcel you were carrying has been reassigned to an earlier traveler.",
        related_match_id: oldMatch.id,
      });
    }

    // Notify sender
    if (parcel?.sender_id) {
      await supabase.from("notifications").insert({
        user_id: parcel.sender_id,
        type: "reassignment_complete",
        content: "Your parcel has been reassigned to an earlier traveler successfully.",
        related_match_id: newMatchId,
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("reassign-parcel error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
