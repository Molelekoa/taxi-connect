import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- SECURITY: admin-only endpoint ---
    // This function registers/re-registers the Yoco webhook AND returns the
    // signing secret once, so it must never be callable by anonymous users.
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
    if (claimsError || !claimsData?.claims?.sub) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const userId = claimsData.claims.sub;

    // Verify caller is an admin via the SECURITY DEFINER has_role RPC
    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (roleError || isAdmin !== true) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const yocoSecretKey = Deno.env.get("YOCO_SECRET_KEY");
    if (!yocoSecretKey) {
      return jsonResponse({ error: "YOCO_SECRET_KEY not configured" }, 500);
    }

    // Prefer the configured app URL over a hard-coded project reference
    const PROJECT_REF = Deno.env.get("SUPABASE_PROJECT_REF") ??
      new URL(Deno.env.get("SUPABASE_URL")!).hostname.split(".")[0];
    const targetUrl = `https://${PROJECT_REF}.supabase.co/functions/v1/yoco-parcel-webhook`;

    const response = await fetch("https://payments.yoco.com/api/webhooks", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${yocoSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "parcolo-parcel-payments",
        url: targetUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Webhook registration failed with status:", response.status);
      return jsonResponse({ status: response.status, error: "Registration failed" }, 400);
    }

    // Return the signing secret ONCE to the authenticated admin so it can be
    // stored as the YOCO_WEBHOOK_SECRET function secret. Never log it.
    const secret = data?.secret ?? data?.data?.secret;

    return jsonResponse(
      {
        ok: true,
        webhookUrl: targetUrl,
        signingSecret: secret ?? null,
        nextStep: secret
          ? "Store this value as YOCO_WEBHOOK_SECRET in Supabase Edge Function secrets. The yoco-parcel-webhook function will reject all events until it is set."
          : "No secret returned by Yoco — check whether one already exists in the Yoco dashboard.",
      },
      200
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Registration error:", message);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
