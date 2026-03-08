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
        status: 401,
        headers: corsHeaders,
      });
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const { matchId, reason } = await req.json();
    if (!matchId || !UUID_RE.test(matchId)) {
      return new Response(JSON.stringify({ error: "Valid matchId (UUID) required" }), {
        status: 400, headers: corsHeaders,
      });
    }
    if (!reason || typeof reason !== "string" || reason.length > 500) {
      return new Response(JSON.stringify({ error: "Reason required (max 500 chars)" }), {
        status: 400, headers: corsHeaders,
      });
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } =
      await authClient.auth.getClaims(token);

    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    const authUid = claimsData.claims.sub;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profileId } = await supabase.rpc("get_profile_id", {
      _auth_uid: authUid,
    });

    if (!profileId) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Fetch match with trip and parcel
    const { data: match, error: matchErr } = await supabase
      .from("matches")
      .select("*, trips(*), parcels(*)")
      .eq("id", matchId)
      .single();

    if (matchErr || !match) {
      return new Response(JSON.stringify({ error: "Match not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    // Verify caller owns the trip
    if (match.trips.traveler_id !== profileId) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: corsHeaders,
      });
    }

    if (match.status !== "accepted") {
      return new Response(
        JSON.stringify({ error: "Match is not in accepted state" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Cancel the match
    await supabase
      .from("matches")
      .update({ status: "cancelled" })
      .eq("id", matchId);

    // Reset parcel to pending and clear traveler_id, store cancel reason and timestamp
    await supabase
      .from("parcels")
      .update({ status: "pending", traveler_id: null, cancel_reason: reason, cancelled_at: new Date().toISOString() })
      .eq("id", match.parcel_id);

    // Log cancellation in cancellations table
    await supabase.from("cancellations").insert({
      parcel_id: match.parcel_id,
      traveler_id: profileId,
      reason: reason,
    });

    // Notify sender
    if (match.parcels.sender_id) {
      await supabase.from("notifications").insert({
        user_id: match.parcels.sender_id,
        type: "delivery_cancelled",
        content: `Your parcel #${match.parcel_id.slice(0, 8)} has been cancelled by the traveler and is now available for other travelers.`,
        related_match_id: matchId,
      });
    }

    // Notify admin(s)
    try {
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (adminRoles && adminRoles.length > 0) {
        const adminNotifications = adminRoles.map((r: any) => ({
          user_id: r.user_id,
          type: "traveler_cancelled",
          content: `Traveler cancelled parcel #${match.parcel_id.slice(0, 8)} (${match.parcels.pickup_location} → ${match.parcels.dropoff_location}). Reason: ${reason}. Parcel returned to available pool.`,
          related_match_id: matchId,
        }));
        await supabase.from("notifications").insert(adminNotifications);
      }
    } catch { /* silent — best effort admin notification */ }

    // Audit log
    await supabase.from("audit_log").insert({
      action: "cancelled_by_traveler",
      table_name: "parcels",
      record_id: match.parcel_id,
      old_values: { status: match.parcels.status, traveler_id: profileId },
      new_values: { status: "pending", traveler_id: null },
      performed_by: profileId,
    });

    // Re-trigger matching to find a replacement
    try {
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/find-matching-trips`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ parcelId: match.parcel_id }),
        }
      );
    } catch {
      // Silent — best effort re-matching
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("cancel-accepted-match error:", err);
    try {
      const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await logError(svc, null, "cancel_accepted_match", err?.message || String(err));
    } catch { /* silent */ }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
