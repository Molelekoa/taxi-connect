import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Only the deployed app origins may call this function
const ALLOWED_ORIGINS = [
  "https://parcolo.com",
  "https://www.parcolo.com",
  "http://localhost:8080",
  "http://localhost:5173",
];

const MAX_LENGTHS: Record<string, number> = {
  contact_name: 120,
  company_name: 160,
  email: 254,
  phone: 32,
  load_description: 2000,
  shipment_type: 60,
  pickup_address: 400,
  delivery_address: 400,
  pickup_location_type: 60,
  delivery_location_type: 60,
  weight: 40,
  dimensions: 120,
  pallet_count: 40,
  commodity_class: 80,
  stackable: 8,
  liftgate_required: 12,
  hazmat_un: 20,
  hazmat_class: 40,
  temp_range: 80,
  countries: 200,
  insurance_coverage: 120,
  special_instructions: 2000,
  reference_numbers: 300,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[\d\s\-+()]{10,}$/;

function corsFor(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = corsFor(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Basic payload size guard
    const rawBody = await req.text();
    if (rawBody.length > 16_000) {
      return new Response(JSON.stringify({ error: "Payload too large" }), {
        status: 413,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Required field validation (mirrors frontend zod schemas) ---
    const contactName = str(body.contactName);
    const email = str(body.email).toLowerCase();
    const phone = str(body.phone);
    const loadDescription = str(body.loadDescription);
    const shipmentType = str(body.shipmentType);
    const pickupAddress = str(body.pickupAddress);
    const deliveryAddress = str(body.deliveryAddress);
    const weight = str(body.weight);

    if (contactName.length < 2) {
      return new Response(JSON.stringify({ error: "Name must be at least 2 characters" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ error: "A valid email is required" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!PHONE_RE.test(phone)) {
      return new Response(JSON.stringify({ error: "A valid phone number is required" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (loadDescription.length < 5 || !shipmentType) {
      return new Response(JSON.stringify({ error: "Load description and shipment type are required" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (pickupAddress.length < 5 || deliveryAddress.length < 5) {
      return new Response(JSON.stringify({ error: "Pickup and delivery addresses are required" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!weight) {
      return new Response(JSON.stringify({ error: "Weight is required" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- Simple rate limit: max 3 submissions per email per 10 minutes ---
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("quote_requests")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", tenMinutesAgo);

    if ((count ?? 0) >= 3) {
      return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- Optional fields, length-capped ---
    const opt = (key: string): string | null => {
      const value = str(body[key]);
      if (!value) return null;
      return value.slice(0, MAX_LENGTHS[key] ?? 200);
    };
    const bool = (key: string): boolean =>
      body[key] === true || body[key] === "true";
    const dateOrNull = (value: unknown): string | null => {
      const s = str(value);
      return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
    };

    const insert = {
      contact_name: contactName.slice(0, MAX_LENGTHS.contact_name),
      company_name: opt("companyName"),
      email,
      phone: phone.slice(0, MAX_LENGTHS.phone),
      load_description: loadDescription.slice(0, MAX_LENGTHS.load_description),
      shipment_type: shipmentType.slice(0, MAX_LENGTHS.shipment_type),
      pickup_address: pickupAddress.slice(0, MAX_LENGTHS.pickup_address),
      pickup_date: dateOrNull(body.pickupDate),
      pickup_location_type: opt("pickupLocationType"),
      delivery_address: deliveryAddress.slice(0, MAX_LENGTHS.delivery_address),
      delivery_date: dateOrNull(body.deliveryDate),
      delivery_location_type: opt("deliveryLocationType"),
      weight,
      dimensions: opt("dimensions"),
      pallet_count: opt("palletCount"),
      commodity_class: opt("commodityClass"),
      stackable: opt("stackable"),
      liftgate_required: opt("liftgateRequired"),
      hazmat: bool("hazmat"),
      hazmat_un: opt("hazmatUN"),
      hazmat_class: opt("hazmatClass"),
      temp_controlled: bool("tempControlled"),
      temp_range: opt("tempRange"),
      international: bool("international"),
      countries: opt("countries"),
      customs_clearance: bool("customsClearance"),
      additional_insurance: bool("additionalInsurance"),
      insurance_coverage: opt("insuranceCoverage"),
      special_instructions: opt("specialInstructions"),
      reference_numbers: opt("referenceNumbers"),
    };

    const { error: insertError } = await supabase.from("quote_requests").insert(insert);

    if (insertError) {
      console.error("quote_requests insert failed:", insertError.message);
      return new Response(JSON.stringify({ error: "Failed to save your request. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("submit-quote-request error:", message);
    try {
      const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await svc.from("error_logs").insert({ user_id: null, action: "submit_quote_request", error_message: message, context: null });
    } catch { /* silent */ }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: corsFor(origin), 
    });
  }
});
