import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Replay-protection window for the webhook-timestamp header (seconds)
const TIMESTAMP_TOLERANCE_SECONDS = 300;

async function logError(action: string, errorMessage: string, context?: Record<string, unknown>) {
  try {
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await svc.from("error_logs").insert({ user_id: null, action, error_message: errorMessage, context: context ?? null });
  } catch { /* silent */ }
}

/** Constant-time comparison of two strings to prevent timing attacks */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function base64Decode(input: string): Uint8Array {
  const binary = atob(input);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Verifies a Standard Webhooks v1 signature (the scheme Yoco uses):
 *   signed_payload = "{webhook-id}.{webhook-timestamp}.{raw_body}"
 *   expected       = base64( HMAC_SHA256( base64_decode(secret_without_whsec_), signed_payload ) )
 *   header         = space-separated list of "v1,<base64sig>" entries
 * Returns null when valid, or a human-readable rejection reason.
 */
async function verifyWebhookSignature(
  rawBody: string,
  headers: Headers,
  secret: string
): Promise<string | null> {
  const webhookId = headers.get("webhook-id");
  const webhookTimestamp = headers.get("webhook-timestamp");
  const webhookSignature = headers.get("webhook-signature");

  if (!webhookId) return "Missing webhook-id header";
  if (!webhookTimestamp) return "Missing webhook-timestamp header";
  if (!webhookSignature) return "Missing webhook-signature header";
  if (!/^\d+$/.test(webhookTimestamp)) return "Invalid webhook-timestamp format";

  // Replay protection
  const age = Math.abs(Math.floor(Date.now() / 1000) - parseInt(webhookTimestamp, 10));
  if (age > TIMESTAMP_TOLERANCE_SECONDS) {
    return `Webhook timestamp outside tolerance (${age}s old)`;
  }

  let keyBytes: Uint8Array;
  try {
    const unprefixed = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
    keyBytes = base64Decode(unprefixed);
  } catch {
    return "YOCO_WEBHOOK_SECRET is not valid base64 — check the value stored in function secrets";
  }

  const signedPayload = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes as unknown as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload) as unknown as ArrayBuffer
  );

  // crypto.subtle returns ArrayBuffers; convert via hex for stable comparison
  const sigBytes = new Uint8Array(sigBuffer);
  const computedHex = Array.from(sigBytes).map((b) => b.toString(16).padStart(2, "0")).join("");

  // Header may contain multiple space-separated signatures during rotation
  const candidates = webhookSignature.split(" ").map((s) => s.trim()).filter(Boolean);
  const v1Sigs = candidates
    .filter((s) => s.startsWith("v1,"))
    .map((s) => s.slice(3));

  if (v1Sigs.length === 0) {
    return "No v1 signature scheme found in webhook-signature header";
  }

  for (const candidate of v1Sigs) {
    try {
      // Normalize both sides through bytes so base64 vs base64url encodings compare correctly
      const candidateBytes = base64Decode(candidate);
      const candidateHex = Array.from(candidateBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
      if (timingSafeEqual(computedHex, candidateHex)) {
        return null;
      }
    } catch {
      // Malformed candidate signature — skip it
    }
  }
  void hexToBytes; // retained helper for future schemes
  return "Signature mismatch";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();

    // --- SECURITY: verify the request actually came from Yoco ---
    // Fail closed: without the signing secret configured we must not
    // trust any payment event. Configure YOCO_WEBHOOK_SECRET with the
    // `whsec_...` value returned by register-yoco-webhook.
    const webhookSecret = Deno.env.get("YOCO_WEBHOOK_SECRET");
    if (!webhookSecret) {
      await logError("yoco_parcel_webhook", "YOCO_WEBHOOK_SECRET not configured - rejecting webhook");
      return new Response(JSON.stringify({ error: "Webhook not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const signatureError = await verifyWebhookSignature(rawBody, req.headers, webhookSecret);
    if (signatureError) {
      await logError("yoco_parcel_webhook", `Signature verification failed: ${signatureError}`);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: { type?: string; id?: string; createdDate?: string; payload?: Record<string, unknown> };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { type, payload } = body;

    if (type !== "payment.succeeded" && type !== "checkout.completed") {
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metadata = (payload?.metadata ?? {}) as Record<string, string>;
    if (!metadata.payment_record_id) {
      await logError("yoco_parcel_webhook", "No payment_record_id in metadata", { eventId: body.id });
      return new Response(JSON.stringify({ error: "Missing metadata" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { payment_record_id, parcel_id, user_id } = metadata;
    const checkoutId = (payload?.id as string) || (payload?.checkoutId as string);

    // Optional but recommended: cross-check the paid amount against our record
    const eventAmountCents =
      typeof payload?.amount === "number"
        ? Math.round(payload.amount)
        : typeof (payload as Record<string, unknown>)?.["amount_in_cents"] === "number"
          ? Math.round((payload as Record<string, number>)["amount_in_cents"])
          : null;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Idempotency check — skip if already paid
    const { data: existingRecord } = await supabase
      .from("payment_records")
      .select("status, amount")
      .eq("id", payment_record_id)
      .single();

    if (existingRecord?.status === "paid") {
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Amount integrity: the amount Yoco actually charged must match what
    // process-parcel-payment recorded for this payment.
    if (
      eventAmountCents !== null &&
      existingRecord?.amount != null &&
      Math.round(Number(existingRecord.amount) * 100) !== eventAmountCents
    ) {
      await logError("yoco_parcel_webhook", "Amount mismatch between Yoco event and payment record", {
        payment_record_id,
        expected_cents: Math.round(Number(existingRecord.amount) * 100),
        received_cents: eventAmountCents,
        event_id: body.id,
      });
      return new Response(JSON.stringify({ error: "Amount mismatch" }), {
        status: 409,
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
      await logError("yoco_parcel_webhook", `Failed to update payment_records: ${paymentError.message}`, {
        payment_record_id,
      });
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
        await logError("yoco_parcel_webhook", `Failed to update parcel: ${parcelError.message}`, { parcel_id });
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    await logError("yoco_parcel_webhook", message);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
