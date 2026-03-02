import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const FILE_SIGNATURES: Array<{ mime: string; magic: number[] }> = [
  { mime: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] },
  { mime: "image/jpeg", magic: [0xff, 0xd8, 0xff] },
  { mime: "image/png", magic: [0x89, 0x50, 0x4e, 0x47] },
];

function detectMimeType(buffer: Uint8Array): string | null {
  for (const sig of FILE_SIGNATURES) {
    if (sig.magic.every((byte, i) => buffer[i] === byte)) return sig.mime;
  }
  return null;
}

function sanitiseFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const profileId = formData.get("profileId") as string | null;
    const purpose = formData.get("purpose") as string | null; // e.g. "id-document"

    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profileId || !purpose) {
      return new Response(JSON.stringify({ error: "Missing profileId or purpose" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate purpose
    const allowedPurposes = ["id-document", "license-copy", "id-copy"];
    if (!allowedPurposes.includes(purpose)) {
      return new Response(JSON.stringify({ error: "Invalid purpose" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: "File too large (max 5 MB)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const detectedMime = detectMimeType(buffer);

    if (!detectedMime) {
      return new Response(
        JSON.stringify({ error: "Invalid file type. Only PDF, JPEG, or PNG are allowed." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const mimeToExt: Record<string, string> = {
      "application/pdf": "pdf",
      "image/jpeg": "jpg",
      "image/png": "png",
    };

    const safeExt = mimeToExt[detectedMime];
    const safeName = sanitiseFilename(purpose);
    const filePath = `${profileId}/${safeName}-${Date.now()}.${safeExt}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(filePath, buffer, { upsert: true, contentType: detectedMime });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload document" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, filePath }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
