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
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    // Resolve the calling user and verify admin.
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await authClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const authUid = claimsData.claims.sub;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", { _user_id: authUid, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const { data: payouts, error } = await supabaseAdmin
      .from("payouts")
      .select("*, profiles:traveler_id(full_name, phone, email), parcels(id, pickup_location, dropoff_location)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("list-payouts error:", error);
      return new Response(JSON.stringify({ error: "Failed to load payouts" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Batch-fetch bank details from traveler_profiles (keyed by profile_id = traveler_id).
    const travelerIds = [...new Set((payouts || []).map((p: any) => p.traveler_id).filter(Boolean))];
    const bankByProfile: Record<string, any> = {};
    if (travelerIds.length > 0) {
      const { data: tp } = await supabaseAdmin
        .from("traveler_profiles")
        .select("profile_id, bank_name, bank_account_holder, bank_account_number, bank_branch_code, bank_account_type")
        .in("profile_id", travelerIds);
      for (const row of tp || []) bankByProfile[row.profile_id] = row;
    }

    const enriched = (payouts || []).map((p: any) => ({ ...p, bank_details: bankByProfile[p.traveler_id] || null }));

    return new Response(JSON.stringify({ payouts: enriched }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("list-payouts error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
