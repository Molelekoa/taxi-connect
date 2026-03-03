import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    if (!matchId || !photoUrl || lat == null || lng == null) {
      return new Response(JSON.stringify({ error: "matchId, photoUrl, lat, and lng are all required" }), {
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

    const now = new Date().toISOString();

    // Update parcel to collected with collection proof
    await supabase
      .from("parcels")
      .update({
        status: "collected",
        collection_photo_url: photoUrl,
        collection_lat: lat,
        collection_lng: lng,
        collected_at: now,
      })
      .eq("id", match.parcel_id);

    // Notify sender
    if (match.parcels.sender_id) {
      await supabase.from("notifications").insert({
        user_id: match.parcels.sender_id,
        type: "parcel_collected",
        content: `Your parcel from ${match.parcels.pickup_location ?? "?"} to ${match.parcels.dropoff_location ?? "?"} has been collected by the traveler.`,
        related_match_id: matchId,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("submit-collection-proof error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
