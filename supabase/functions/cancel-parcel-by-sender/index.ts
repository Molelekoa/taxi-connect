import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logError = async (supabase: any, userId: string | null, action: string, errorMessage: string, context?: Record<string, any>) => {
  try {
    await supabase.from("error_logs").insert({ user_id: userId, action, error_message: errorMessage, context: context ?? null });
  } catch { /* silent */ }
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: corsHeaders,
      });
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const { parcelId, reason } = await req.json();
    if (!parcelId || !UUID_RE.test(parcelId)) {
      return new Response(JSON.stringify({ error: "Valid parcelId (UUID) required" }), {
        status: 400, headers: corsHeaders,
      });
    }
    if (reason && (typeof reason !== "string" || reason.length > 500)) {
      return new Response(JSON.stringify({ error: "Reason must be a string (max 500 chars)" }), {
        status: 400, headers: corsHeaders,
      });
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await authClient.auth.getClaims(token);

    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: corsHeaders,
      });
    }

    const authUid = claimsData.claims.sub;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profileId } = await supabase.rpc("get_profile_id", { _auth_uid: authUid });
    if (!profileId) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404, headers: corsHeaders,
      });
    }

    // Fetch parcel
    const { data: parcel, error: parcelErr } = await supabase
      .from("parcels")
      .select("*")
      .eq("id", parcelId)
      .single();

    if (parcelErr || !parcel) {
      return new Response(JSON.stringify({ error: "Parcel not found" }), {
        status: 404, headers: corsHeaders,
      });
    }

    // Verify caller is the sender
    if (parcel.sender_id !== profileId) {
      return new Response(JSON.stringify({ error: "Forbidden — only the sender can cancel" }), {
        status: 403, headers: corsHeaders,
      });
    }

    // Don't allow cancellation of already-delivered parcels
    if (["delivered", "delivered_verified", "delivered_pending_verification"].includes(parcel.status)) {
      return new Response(JSON.stringify({ error: "Cannot cancel a delivered parcel" }), {
        status: 400, headers: corsHeaders,
      });
    }

    const previousTravelerId = parcel.traveler_id;
    const cancelReason = reason || "Cancelled by sender";

    // Reset parcel to pending, clear traveler
    await supabase
      .from("parcels")
      .update({
        status: "pending",
        traveler_id: null,
        cancel_reason: cancelReason,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", parcelId);

    // Cancel all active matches for this parcel
    const { data: activeMatches } = await supabase
      .from("matches")
      .select("id, trip_id")
      .eq("parcel_id", parcelId)
      .in("status", ["pending", "accepted"]);

    if (activeMatches && activeMatches.length > 0) {
      await supabase
        .from("matches")
        .update({ status: "cancelled" })
        .in("id", activeMatches.map((m: any) => m.id));
    }

    // Log cancellation
    await supabase.from("cancellations").insert({
      parcel_id: parcelId,
      traveler_id: previousTravelerId,
      reason: cancelReason,
    });

    // Audit log
    await supabase.from("audit_log").insert({
      action: "cancelled_by_sender",
      table_name: "parcels",
      record_id: parcelId,
      old_values: { status: parcel.status, traveler_id: previousTravelerId },
      new_values: { status: "pending", traveler_id: null },
      performed_by: profileId,
    });

    // Notify the assigned traveler (if any)
    if (previousTravelerId) {
      await supabase.from("notifications").insert({
        user_id: previousTravelerId,
        type: "delivery_cancelled",
        content: `The sender has cancelled parcel #${parcelId.slice(0, 8)}. You are no longer responsible for this delivery.`,
      });
    }

    // Notify admin(s)
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminRoles && adminRoles.length > 0) {
      const adminNotifications = adminRoles.map((r: any) => ({
        user_id: r.user_id,
        type: "sender_cancelled",
        content: `Sender cancelled parcel #${parcelId.slice(0, 8)} (${parcel.pickup_location} → ${parcel.dropoff_location}). Reason: ${cancelReason}. Parcel returned to available pool.`,
      }));
      await supabase.from("notifications").insert(adminNotifications);
    }

    // Re-trigger matching
    try {
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/find-matching-trips`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ parcelId }),
        }
      );
    } catch { /* best effort */ }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("cancel-parcel-by-sender error:", err);
    try {
      const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await logError(svc, null, "cancel_parcel_by_sender", err?.message || String(err));
    } catch { /* silent */ }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500, headers: corsHeaders,
    });
  }
});
