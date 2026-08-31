import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

    const { payoutId, notes } = await req.json();
    if (!payoutId || !UUID_RE.test(payoutId)) {
      return new Response(JSON.stringify({ error: "payoutId required" }), { status: 400, headers: corsHeaders });
    }

    const now = new Date().toISOString();
    const { data: payout, error: fetchErr } = await supabaseAdmin
      .from("payouts")
      .select("id, traveler_id")
      .eq("id", payoutId)
      .single();
    if (fetchErr || !payout) {
      return new Response(JSON.stringify({ error: "Payout not found" }), { status: 404, headers: corsHeaders });
    }

    const { error } = await supabaseAdmin
      .from("payouts")
      .update({ status: "paid", paid_at: now, notes: notes ? String(notes).slice(0, 500) : null })
      .eq("id", payoutId);
    if (error) {
      console.error("mark-payout-paid error:", error);
      return new Response(JSON.stringify({ error: "Failed to update payout" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Notify the traveler that their payout has been sent.
    if (payout.traveler_id) {
      await supabaseAdmin.from("notifications").insert({
        user_id: payout.traveler_id,
        type: "payout_paid",
        content: "Your delivery payout has been sent to your bank account.",
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("mark-payout-paid error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
