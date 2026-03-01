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

    const { parcelId } = await req.json();
    if (!parcelId) {
      return new Response(JSON.stringify({ error: "parcelId required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch parcel
    const { data: parcel, error: pErr } = await supabase
      .from("parcels")
      .select("*")
      .eq("id", parcelId)
      .single();

    if (pErr || !parcel) {
      return new Response(JSON.stringify({ error: "Parcel not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Build query for matching trips
    let query = supabase
      .from("trips")
      .select("*")
      .eq("status", "active")
      .ilike("origin_city", parcel.pickup_location || "")
      .ilike("destination_city", parcel.dropoff_location || "");

    if (parcel.pickup_earliest) {
      query = query.gte("travel_date", parcel.pickup_earliest);
    }
    if (parcel.pickup_latest) {
      query = query.lte("travel_date", parcel.pickup_latest);
    }
    if (parcel.weight_kg) {
      query = query.gte("available_weight_kg", parcel.weight_kg);
    }

    const { data: trips, error: tErr } = await query;

    if (tErr) {
      console.error("Error querying trips:", tErr);
      return new Response(JSON.stringify({ error: "Failed to query trips" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const matchResults = [];

    for (const trip of trips || []) {
      // Check if match already exists
      const { data: existing } = await supabase
        .from("matches")
        .select("id")
        .eq("parcel_id", parcelId)
        .eq("trip_id", trip.id)
        .maybeSingle();

      if (existing) continue;

      // Insert match
      const { data: match, error: mErr } = await supabase
        .from("matches")
        .insert({ parcel_id: parcelId, trip_id: trip.id })
        .select("id")
        .single();

      if (mErr) continue;

      // Notify traveler
      await supabase.from("notifications").insert({
        user_id: trip.traveler_id,
        type: "new_match",
        content: `New parcel available: ${parcel.weight_kg || "?"}kg from ${parcel.pickup_location} to ${parcel.dropoff_location}`,
        related_match_id: match.id,
      });

      matchResults.push(match.id);
    }

    return new Response(
      JSON.stringify({ matches: matchResults.length, matchIds: matchResults }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("find-matching-trips error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
