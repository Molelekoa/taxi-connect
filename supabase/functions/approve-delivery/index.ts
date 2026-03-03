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

    // Fetch parcel with its accepted match to find the traveler
    const { data: parcel, error: parcelErr } = await supabase
      .from("parcels")
      .select("*")
      .eq("id", parcelId)
      .single();

    if (parcelErr || !parcel) {
      return new Response(JSON.stringify({ error: "Parcel not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    if (parcel.status !== "pending_confirmation") {
      return new Response(
        JSON.stringify({ error: "Parcel must be in pending_confirmation state" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Update parcel status to delivered
    const { error: updateErr } = await supabase
      .from("parcels")
      .update({ status: "delivered" })
      .eq("id", parcelId);

    if (updateErr) {
      return new Response(JSON.stringify({ error: "Failed to update parcel status" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Calculate payment timeline
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...6=Sat
    let paymentMessage: string;

    if (dayOfWeek >= 1 && dayOfWeek <= 4) {
      // Mon-Thu
      paymentMessage =
        "Your delivery has been approved! Payment will be made within 72 hours.";
    } else {
      // Fri, Sat, Sun
      paymentMessage =
        "Your delivery has been approved! Payment will be made on Wednesday.";
    }

    // Find the traveler via the accepted match
    const { data: match } = await supabase
      .from("matches")
      .select("*, trips(traveler_id)")
      .eq("parcel_id", parcelId)
      .eq("status", "accepted")
      .single();

    if (match?.trips?.traveler_id) {
      await supabase.from("notifications").insert({
        user_id: match.trips.traveler_id,
        type: "delivery_approved",
        content: paymentMessage,
        related_match_id: match.id,
      });
    }

    // Also notify sender
    if (parcel.sender_id) {
      await supabase.from("notifications").insert({
        user_id: parcel.sender_id,
        type: "delivery_completed",
        content: `Your parcel from ${parcel.pickup_location ?? "?"} to ${parcel.dropoff_location ?? "?"} has been delivered and confirmed by admin.`,
        related_match_id: match?.id ?? null,
      });
    }

    return new Response(JSON.stringify({ success: true, paymentMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("approve-delivery error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
