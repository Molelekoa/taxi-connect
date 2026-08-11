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
    // --- Admin authentication (required: this triggers payout state changes) ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
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
    const adminCheckClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: isAdmin } = await adminCheckClient.rpc("has_role", { _user_id: authUid, _role: "admin" });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const { matchId, action } = await req.json();
    if (!matchId || !UUID_RE.test(matchId) || !["approve", "reject"].includes(action)) {
      return new Response(JSON.stringify({ error: "matchId and action ('approve' or 'reject') required" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch match with trip and parcel
    const { data: match, error: matchErr } = await supabase
      .from("matches")
      .select("*, trips(traveler_id), parcels(id, pickup_location, dropoff_location, sender_id)")
      .eq("id", matchId)
      .single();

    if (matchErr || !match) {
      return new Response(JSON.stringify({ error: "Match not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    if (action === "approve") {
      // Update match delivery_status
      await supabase
        .from("matches")
        .update({ delivery_status: "delivered_verified" })
        .eq("id", matchId);

      // Update parcel status and set verified_at
      await supabase
        .from("parcels")
        .update({ status: "delivered_verified", verified_at: new Date().toISOString() })
        .eq("id", match.parcel_id);

      // Calculate payment timeline
      const now = new Date();
      const dayOfWeek = now.getDay();
      const paymentMessage = (dayOfWeek >= 1 && dayOfWeek <= 4)
        ? "Your delivery has been approved! Payment will be made within 72 hours."
        : "Your delivery has been approved! Payment will be made on Wednesday.";

      // Notify traveler
      if (match.trips?.traveler_id) {
        await supabase.from("notifications").insert({
          user_id: match.trips.traveler_id,
          type: "delivery_approved",
          content: paymentMessage,
          related_match_id: matchId,
        });
      }

      // Notify sender
      if (match.parcels?.sender_id) {
        await supabase.from("notifications").insert({
          user_id: match.parcels.sender_id,
          type: "delivery_completed",
          content: `Your parcel from ${match.parcels.pickup_location ?? "?"} to ${match.parcels.dropoff_location ?? "?"} has been delivered and verified by admin.`,
          related_match_id: matchId,
        });
      }

      return new Response(JSON.stringify({ success: true, paymentMessage }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      // Reject
      await supabase
        .from("matches")
        .update({ delivery_status: "rejected" })
        .eq("id", matchId);

      // Reset parcel status back to matched
      await supabase
        .from("parcels")
        .update({ status: "matched" })
        .eq("id", match.parcel_id);

      // Notify traveler to resubmit
      if (match.trips?.traveler_id) {
        await supabase.from("notifications").insert({
          user_id: match.trips.traveler_id,
          type: "delivery_rejected",
          content: `Your delivery proof for ${match.parcels?.pickup_location ?? "?"} → ${match.parcels?.dropoff_location ?? "?"} was rejected. Please resubmit with clearer proof.`,
          related_match_id: matchId,
        });
      }

      return new Response(JSON.stringify({ success: true, action: "rejected" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err: any) {
    console.error("verify-delivery error:", err);
    try {
      const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await svc.from("error_logs").insert({ user_id: null, action: "verify_delivery", error_message: err?.message || String(err), context: null });
    } catch { /* silent */ }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
