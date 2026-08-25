import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  calculateBandPriceServer,
  VALID_BAND_IDS,
  MIN_TRUSTED_DISTANCE_KM,
  MAX_TRUSTED_DISTANCE_KM,
} from "../_shared/pricing.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Pay-now incentive applied SERVER-SIDE. Clients never set the charge amount. */
const PAY_NOW_DISCOUNT_FACTOR = 0.9;

async function logError(action: string, errorMessage: string, context?: Record<string, unknown>) {
  try {
    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await svc.from("error_logs").insert({ user_id: null, action, error_message: errorMessage, context: context ?? null });
  } catch { /* silent */ }
}

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
      console.warn(`Yoco API returned ${response.status}, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }

    return response;
  }

  // Final attempt without retry
  return fetch(url, options);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user from their JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userId = claimsData.claims.sub;

    // Parse and validate body — NOTE: the client may NOT specify an amount.
    // The charge is derived entirely from database records below.
    const body = await req.json();
    const { parcelId, paymentRecordId } = body;

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!parcelId || !paymentRecordId) {
      return jsonResponse({ error: "Missing required fields: parcelId, paymentRecordId" }, 400);
    }
    if (!UUID_RE.test(parcelId) || !UUID_RE.test(paymentRecordId)) {
      return jsonResponse({ error: "parcelId and paymentRecordId must be valid UUIDs" }, 400);
    }

    // Service-role client for reads/writes that RLS would otherwise block
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- Load the payment record and verify ownership ---
    const { data: paymentRecord, error: recordError } = await adminClient
      .from("payment_records")
      .select("id, user_id, parcel_id, amount, currency, status")
      .eq("id", paymentRecordId)
      .single();

    if (recordError || !paymentRecord) {
      return jsonResponse({ error: "Payment record not found" }, 404);
    }
    if (paymentRecord.status !== "pending") {
      return jsonResponse({ error: "This payment has already been processed" }, 409);
    }

    // The payment record must belong to the authenticated user's profile
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("id")
      .eq("auth_id", userId)
      .single();

    if (profileError || !profile || paymentRecord.user_id !== profile.id) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    // The payment record must reference the same parcel being paid for
    if (paymentRecord.parcel_id && paymentRecord.parcel_id !== parcelId) {
      return jsonResponse({ error: "Payment record does not match this parcel" }, 400);
    }

    // --- Load the parcel and verify it is payable by this sender ---
    const { data: parcel, error: parcelError } = await adminClient
      .from("parcels")
      .select("id, sender_id, pickup_location, dropoff_location, weight_band, weight_kg, distance_km, include_tracking, payment_status")
      .eq("id", parcelId)
      .single();

    if (parcelError || !parcel) {
      return jsonResponse({ error: "Parcel not found" }, 404);
    }
    if (parcel.sender_id !== paymentRecord.user_id) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }
    if (parcel.payment_status === "paid") {
      return jsonResponse({ error: "This parcel has already been paid" }, 409);
    }

    // --- Compute the authoritative price SERVER-SIDE ---
    if (!parcel.pickup_location || !parcel.dropoff_location || !parcel.weight_band) {
      await logError("process_parcel_payment", "Parcel missing pricing inputs", { parcelId });
      return jsonResponse({ error: "Parcel pricing information is incomplete" }, 422);
    }
    if (!VALID_BAND_IDS.includes(parcel.weight_band)) {
      return jsonResponse({ error: "Parcel has an invalid weight band" }, 422);
    }

    const rawDistance = typeof parcel.distance_km === "number" ? Number(parcel.distance_km) : undefined;
    const distanceKm =
      rawDistance !== undefined && Number.isFinite(rawDistance)
        ? Math.min(MAX_TRUSTED_DISTANCE_KM, Math.max(MIN_TRUSTED_DISTANCE_KM, rawDistance))
        : undefined;

    const basePrice = calculateBandPriceServer(
      parcel.pickup_location,
      parcel.dropoff_location,
      parcel.weight_band,
      distanceKm,
      Boolean(parcel.include_tracking)
    );

    if (basePrice === null) {
      await logError("process_parcel_payment", "Server-side price calculation failed", {
        parcelId,
        band: parcel.weight_band,
      });
      return jsonResponse({ error: "Unable to determine parcel price" }, 422);
    }

    // Apply the pay-now discount authoritatively and convert to cents.
    // The client-supplied amount is ignored completely.
    const chargeZar = Math.round(basePrice * PAY_NOW_DISCOUNT_FACTOR * 100) / 100;
    const amountCents = Math.round(chargeZar * 100);

    if (amountCents < 100) {
      return jsonResponse({ error: "Computed charge is below the minimum allowed amount" }, 422);
    }

    // Persist the authoritative amount BEFORE creating the checkout so the
    // webhook can verify the charged amount against this record.
    const { error: amountUpdateError } = await adminClient
      .from("payment_records")
      .update({ amount: chargeZar, currency: "ZAR", updated_at: new Date().toISOString() })
      .eq("id", paymentRecordId);

    if (amountUpdateError) {
      await logError("process_parcel_payment", `Failed to persist charge amount: ${amountUpdateError.message}`, {
        paymentRecordId,
      });
      return jsonResponse({ error: "Failed to prepare payment" }, 500);
    }

    // Call Yoco Checkout API
    const YOCO_SECRET_KEY = Deno.env.get("YOCO_SECRET_KEY");
    if (!YOCO_SECRET_KEY) {
      console.error("YOCO_SECRET_KEY not configured");
      return jsonResponse({ error: "Payment service not configured" }, 500);
    }

    const APP_URL = Deno.env.get("APP_URL") || "https://parcolo.com";

    const yocoResponse = await fetchWithRetry("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${YOCO_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountCents,
        currency: "ZAR",
        successUrl: `${APP_URL}/parcel-payment-success?payment_id=${paymentRecordId}`,
        cancelUrl: `${APP_URL}/parcel-payment-cancelled?payment_id=${paymentRecordId}`,
        metadata: {
          user_id: userId,
          parcel_id: parcelId,
          payment_record_id: paymentRecordId,
        },
      }),
    });

    if (!yocoResponse.ok) {
      const errorText = await yocoResponse.text();
      console.error("Yoco API error:", errorText);
      await logError("process_parcel_payment", `Yoco API error ${yocoResponse.status}`, { paymentRecordId });
      return jsonResponse({ error: "Payment service error" }, 502);
    }

    const yocoData = await yocoResponse.json();

    // Link the checkout id on the payment record
    await adminClient
      .from("payment_records")
      .update({ yoco_checkout_id: yocoData.id, updated_at: new Date().toISOString() })
      .eq("id", paymentRecordId);

    return jsonResponse(
      {
        redirectUrl: yocoData.redirectUrl,
        checkoutId: yocoData.id,
        amountCharged: chargeZar,
      },
      200
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("process-parcel-payment error:", message);
    await logError("process_parcel_payment", message);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
