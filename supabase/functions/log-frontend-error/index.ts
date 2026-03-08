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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Optionally extract user from JWT (best-effort, don't block on failure)
    let profileId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabase.auth.getClaims(token);
        if (data?.claims?.sub) {
          const { data: pid } = await supabase.rpc("get_profile_id", { _auth_uid: data.claims.sub });
          profileId = pid;
        }
      } catch { /* best effort */ }
    }

    const body = await req.json();
    const { error_message, stack, component_stack, url, user_agent } = body;

    if (!error_message || typeof error_message !== "string") {
      return new Response(JSON.stringify({ error: "error_message required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("error_logs").insert({
      user_id: profileId,
      action: "frontend_error",
      error_message: error_message.slice(0, 1000),
      context: {
        stack: stack?.slice(0, 2000),
        component_stack: component_stack?.slice(0, 2000),
        url: url?.slice(0, 500),
        user_agent: user_agent?.slice(0, 500),
        source: "ErrorBoundary",
      },
    });

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("log-frontend-error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
