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

    if (!trips || trips.length === 0) {
      return new Response(
        JSON.stringify({ matches: 0, matchIds: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Batch existence check — single query instead of N queries
    const tripIds = trips.map(t => t.id);
    const { data: existingMatches } = await supabase
      .from("matches")
      .select("trip_id")
      .eq("parcel_id", parcelId)
      .in("trip_id", tripIds);

    const existingTripIds = new Set((existingMatches || []).map(m => m.trip_id));

    const matchResults: string[] = [];
    const notificationsToInsert: Array<{ user_id: string; type: string; content: string; related_match_id: string }> = [];

    for (const trip of trips) {
      if (existingTripIds.has(trip.id)) continue;

      const { data: match, error: mErr } = await supabase
        .from("matches")
        .insert({ parcel_id: parcelId, trip_id: trip.id })
        .select("id")
        .single();

      if (mErr || !match) continue;

      notificationsToInsert.push({
        user_id: trip.traveler_id,
        type: "new_match",
        content: `New parcel matches your ${trip.origin_city} → ${trip.destination_city} route: ${parcel.weight_kg || "?"}kg, pickup ${parcel.pickup_earliest || "TBD"} – ${parcel.pickup_latest || "TBD"}`,
        related_match_id: match.id,
      });

      matchResults.push(match.id);
    }

    // Batch insert all notifications in one query
    if (notificationsToInsert.length > 0) {
      await supabase.from("notifications").insert(notificationsToInsert);
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
