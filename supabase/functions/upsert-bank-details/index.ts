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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { bankName, bankAccountHolder, bankAccountNumber, bankBranchCode, bankAccountType } = await req.json();

    // Basic server-side validation / length limits
    const value = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 100) : "");
    const cleaned = {
      bankName: value(bankName),
      bankAccountHolder: value(bankAccountHolder),
      bankAccountNumber: value(bankAccountNumber),
      bankBranchCode: value(bankBranchCode),
      bankAccountType: value(bankAccountType),
    };

    if (!cleaned.bankAccountHolder || !cleaned.bankAccountNumber || !cleaned.bankName) {
      return new Response(JSON.stringify({ error: "Bank name, account holder and account number are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve current user's profile id
    const { data: pid } = await supabaseAdmin.rpc("get_profile_id", { _auth_uid: user.id });
    if (!pid) {
      return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: corsHeaders });
    }

    const { error } = await supabaseAdmin
      .from("traveler_profiles")
      .update(cleaned)
      .eq("profile_id", pid);

    if (error) {
      console.error("upsert-bank-details error:", error);
      return new Response(JSON.stringify({ error: "Failed to save bank details" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("upsert-bank-details error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
