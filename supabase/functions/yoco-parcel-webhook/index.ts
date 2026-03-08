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
    const body = await req.json();
    console.log("Yoco webhook received:", JSON.stringify(body));

    const { type, payload } = body;

    if (type !== "payment.succeeded" && type !== "checkout.completed") {
      console.log("Ignoring event type:", type);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metadata = payload?.metadata;
    if (!metadata?.payment_record_id) {
      console.error("No payment_record_id in metadata");
      return new Response(JSON.stringify({ error: "Missing metadata" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { payment_record_id, parcel_id, user_id } = metadata;
    const checkoutId = payload?.id || payload?.checkoutId;

    // Use service role to update records
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Idempotency check — skip if already paid
    const { data: existingRecord } = await supabase
      .from("payment_records")
      .select("status")
      .eq("id", payment_record_id)
      .single();

    if (existingRecord?.status === "paid") {
      console.log("Payment already processed, skipping (idempotent):", payment_record_id);
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update payment record
    const { error: paymentError } = await supabase
      .from("payment_records")
      .update({
        status: "paid",
        yoco_checkout_id: checkoutId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment_record_id);

    if (paymentError) {
      console.error("Failed to update payment_records:", paymentError);
    }

    // Update parcel payment status
    if (parcel_id) {
      const { error: parcelError } = await supabase
        .from("parcels")
        .update({
          payment_status: "paid",
          payment_record_id: payment_record_id,
        })
        .eq("id", parcel_id);

      if (parcelError) {
        console.error("Failed to update parcel:", parcelError);
      }
    }

    // Get sender profile ID for notification
    if (user_id && parcel_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user_id)
        .single();

      if (profile) {
        await supabase.from("notifications").insert({
          user_id: profile.id,
          type: "payment_confirmed",
          content: `Your payment for parcel has been confirmed. Your parcel is now available for travelers.`,
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    try {
      const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await svc.from("error_logs").insert({ user_id: null, action: "yoco_parcel_webhook", error_message: error?.message || String(error), context: null });
    } catch { /* silent */ }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
