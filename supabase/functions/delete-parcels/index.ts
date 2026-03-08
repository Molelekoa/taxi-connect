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
    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the user is an admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;

    // Check admin role using service role client
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: isAdmin } = await adminClient.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { parcelIds, photosOnly } = await req.json();

    if (!parcelIds || !Array.isArray(parcelIds) || parcelIds.length === 0) {
      return new Response(JSON.stringify({ error: "No parcel IDs provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (parcelIds.length > 200 || parcelIds.some((id: any) => typeof id !== "string" || !UUID_RE.test(id))) {
      return new Response(JSON.stringify({ error: "Invalid parcel IDs (must be valid UUIDs, max 200)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let deletedFiles = 0;
    let deletedParcels = 0;

    // Fetch parcels to collect storage file paths
    const { data: parcels, error: fetchErr } = await adminClient
      .from("parcels")
      .select("id, photo_url, collection_photo_url")
      .in("id", parcelIds);

    if (fetchErr) {
      throw new Error(`Failed to fetch parcels: ${fetchErr.message}`);
    }

    // Collect storage paths to delete
    const storagePaths: string[] = [];
    for (const parcel of parcels ?? []) {
      // Extract storage paths from URLs or direct paths
      const urls = [parcel.photo_url, parcel.collection_photo_url].filter(Boolean);
      for (const url of urls) {
        if (!url) continue;
        // If it's a storage path (not a full URL), use it directly
        if (!url.startsWith("http")) {
          storagePaths.push(url);
        } else {
          // Try to extract the storage path from the URL
          const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/documents\/(.+?)(?:\?|$)/);
          if (match) {
            storagePaths.push(match[1]);
          }
        }
      }
    }

    // Also collect match proof photos
    const { data: matches } = await adminClient
      .from("matches")
      .select("id, proof_photo_url")
      .in("parcel_id", parcelIds);

    for (const match of matches ?? []) {
      if (match.proof_photo_url) {
        if (!match.proof_photo_url.startsWith("http")) {
          storagePaths.push(match.proof_photo_url);
        } else {
          const match2 = match.proof_photo_url.match(/\/storage\/v1\/object\/(?:public|sign)\/documents\/(.+?)(?:\?|$)/);
          if (match2) {
            storagePaths.push(match2[1]);
          }
        }
      }
    }

    // Step 1: Delete files from storage FIRST (prevents orphaned S3 objects)
    if (storagePaths.length > 0) {
      // Delete in batches of 100
      for (let i = 0; i < storagePaths.length; i += 100) {
        const batch = storagePaths.slice(i, i + 100);
        const { error: removeErr } = await adminClient.storage
          .from("documents")
          .remove(batch);
        if (!removeErr) {
          deletedFiles += batch.length;
        } else {
          console.error("Storage delete error for batch:", removeErr);
        }
      }
    }

    if (photosOnly) {
      // Clear photo URLs from parcel records but keep the records
      for (const parcelId of parcelIds) {
        await adminClient
          .from("parcels")
          .update({
            photo_url: null,
            collection_photo_url: null,
          } as any)
          .eq("id", parcelId);
      }
      // Clear match proof photos
      if (matches && matches.length > 0) {
        for (const m of matches) {
          await adminClient
            .from("matches")
            .update({ proof_photo_url: null } as any)
            .eq("id", m.id);
        }
      }
      deletedParcels = 0; // Records preserved
    } else {
      // Step 2: Delete related records (order matters for FK constraints)
      
      // Delete notifications related to matches
      const matchIds = (matches ?? []).map(m => m.id);
      if (matchIds.length > 0) {
        await adminClient.from("notifications").delete().in("related_match_id", matchIds);
      }

      // Delete matches
      await adminClient.from("matches").delete().in("parcel_id", parcelIds);

      // Delete cancellations
      await adminClient.from("cancellations").delete().in("parcel_id", parcelIds);

      // Delete delivery ratings
      await adminClient.from("delivery_ratings").delete().in("parcel_id", parcelIds);

      // Delete notifications for senders/travelers (by looking at parcel sender_id/traveler_id)
      // These are already cleaned up by cascade or match-based deletion

      // Delete audit log entries
      for (const id of parcelIds) {
        await adminClient.from("audit_log").delete().eq("record_id", id).eq("table_name", "parcels");
      }

      // Step 3: Finally delete the parcels themselves
      const { error: delErr } = await adminClient.from("parcels").delete().in("id", parcelIds);
      if (delErr) {
        throw new Error(`Failed to delete parcels: ${delErr.message}`);
      }
      deletedParcels = parcelIds.length;
    }

    return new Response(
      JSON.stringify({ deletedParcels, deletedFiles, totalProcessed: parcelIds.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("delete-parcels error:", err);
    try {
      const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await svc.from("error_logs").insert({ user_id: null, action: "delete_parcels", error_message: err?.message || String(err), context: null });
    } catch { /* silent */ }
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
