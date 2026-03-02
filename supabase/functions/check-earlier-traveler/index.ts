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

    // Get the new trip
    const { data: newTrip, error: tripErr } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (tripErr || !newTrip) {
      return new Response(JSON.stringify({ error: "Trip not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Find parcels on this route that already have accepted matches
    const { data: parcels } = await supabase
      .from("parcels")
      .select("id, sender_id, pickup_location, dropoff_location, pickup_earliest, pickup_latest, weight_kg")
      .eq("status", "matched")
      .ilike("pickup_location", newTrip.origin_city)
      .ilike("dropoff_location", newTrip.destination_city);

    let notified = 0;

    for (const parcel of parcels || []) {
      // Check date window compatibility
      if (parcel.pickup_earliest && newTrip.travel_date < parcel.pickup_earliest) continue;
      if (parcel.pickup_latest && newTrip.travel_date > parcel.pickup_latest) continue;
      // Check weight
      if (parcel.weight_kg && parcel.weight_kg > newTrip.available_weight_kg) continue;

      // Find existing accepted match for this parcel
      const { data: existingMatch } = await supabase
        .from("matches")
        .select("id, trip_id")
        .eq("parcel_id", parcel.id)
        .eq("status", "accepted")
        .single();

      if (!existingMatch) continue;

      // Get the existing trip's travel date
      const { data: existingTrip } = await supabase
        .from("trips")
        .select("travel_date")
        .eq("id", existingMatch.trip_id)
        .single();

      if (!existingTrip) continue;

      // Only notify if the new trip is sooner
      if (newTrip.travel_date >= existingTrip.travel_date) continue;

      // Create a pending match for the new trip
      const { data: newMatch, error: matchErr } = await supabase
        .from("matches")
        .insert({ parcel_id: parcel.id, trip_id: tripId, status: "pending" })
        .select("id")
        .single();

      if (matchErr || !newMatch) continue;

      // Notify sender
      if (parcel.sender_id) {
        await supabase.from("notifications").insert({
          user_id: parcel.sender_id,
          type: "earlier_traveler_available",
          content: `An earlier traveler (traveling on ${newTrip.travel_date}) is available for your parcel. Would you like to reassign?`,
          related_match_id: newMatch.id,
        });
        notified++;
      }
    }

    return new Response(
      JSON.stringify({ notified }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("check-earlier-traveler error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
