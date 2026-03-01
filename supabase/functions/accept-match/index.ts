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

    const { matchId } = await req.json();
    if (!matchId) {
      return new Response(JSON.stringify({ error: "matchId required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Auth client to verify the caller
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

    // Service role client for writes
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get profile id
    const { data: profileId } = await supabase.rpc("get_profile_id", {
      _auth_uid: authUid,
    });

    if (!profileId) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Fetch the match with trip and parcel
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

    // Verify the caller owns the trip
    if (match.trips.traveler_id !== profileId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    if (match.status !== "pending") {
      return new Response(
        JSON.stringify({ error: "Match already " + match.status }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Accept the match
    await supabase
      .from("matches")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", matchId);

    // Update parcel status
    await supabase
      .from("parcels")
      .update({ status: "matched", traveler_id: profileId })
      .eq("id", match.parcel_id);

    // Get traveler profile for notification
    const { data: travelerProfile } = await supabase
      .from("profiles")
      .select("full_name, phone, email")
      .eq("id", profileId)
      .single();

    // Notify sender
    if (match.parcels.sender_id) {
      const travelerName = travelerProfile?.full_name || "A traveler";
      await supabase.from("notifications").insert({
        user_id: match.parcels.sender_id,
        type: "match_accepted",
        content: `Your parcel has been accepted by ${travelerName}. They will contact you soon.`,
        related_match_id: matchId,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("accept-match error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
