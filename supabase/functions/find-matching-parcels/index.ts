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
    // Verify authorization - accept service role key or valid user JWT
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
      // Verify as user JWT
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

    const { tripId } = await req.json();
    if (!tripId) {
      return new Response(JSON.stringify({ error: "tripId required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch trip
    const { data: trip, error: tErr } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (tErr || !trip) {
      return new Response(JSON.stringify({ error: "Trip not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Find matching parcels
    const { data: parcels, error: pErr } = await supabase
      .from("parcels")
      .select("*")
      .eq("status", "pending")
      .ilike("pickup_location", trip.origin_city)
      .ilike("dropoff_location", trip.destination_city)
      .lte("pickup_earliest", trip.travel_date)
      .gte("pickup_latest", trip.travel_date)
      .lte("weight_kg", trip.available_weight_kg);

    if (pErr) {
      console.error("Error querying parcels:", pErr);
      return new Response(JSON.stringify({ error: "Failed to query parcels" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const matchResults = [];

    for (const parcel of parcels || []) {
      // Check for existing match
      const { data: existing } = await supabase
        .from("matches")
        .select("id")
        .eq("parcel_id", parcel.id)
        .eq("trip_id", tripId)
        .maybeSingle();

      if (existing) continue;

      const { data: match, error: mErr } = await supabase
        .from("matches")
        .insert({ parcel_id: parcel.id, trip_id: tripId })
        .select("id")
        .single();

      if (mErr) continue;

      // Notify sender
      if (parcel.sender_id) {
        await supabase.from("notifications").insert({
          user_id: parcel.sender_id,
          type: "new_match",
          content: `A traveler is available for your ${parcel.pickup_location} → ${parcel.dropoff_location} parcel on ${trip.travel_date}`,
          related_match_id: match.id,
        });
      }

      matchResults.push(match.id);
    }

    return new Response(
      JSON.stringify({ matches: matchResults.length, matchIds: matchResults }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("find-matching-parcels error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
