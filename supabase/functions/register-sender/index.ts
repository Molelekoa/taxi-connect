import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Full CORS header set required by Supabase client libraries
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Magic-number signatures for allowed file types
const FILE_SIGNATURES: Array<{ mime: string; magic: number[] }> = [
  { mime: "application/pdf", magic: [0x25, 0x50, 0x44, 0x46] }, // %PDF
  { mime: "image/jpeg",      magic: [0xff, 0xd8, 0xff] },
  { mime: "image/png",       magic: [0x89, 0x50, 0x4e, 0x47] }, // ‰PNG
];

function detectMimeType(buffer: Uint8Array): string | null {
  for (const sig of FILE_SIGNATURES) {
    if (sig.magic.every((byte, i) => buffer[i] === byte)) {
      return sig.mime;
    }
  }
  return null;
}

/** Sanitise a filename to prevent path traversal */
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

    // Verify the JWT and get the user
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

    // Parse multipart form data
    const formData = await req.formData();
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const country = formData.get("country") as string;
    const physicalAddress = formData.get("physicalAddress") as string;
    const legalDeclarationAccepted = formData.get("legalDeclarationAccepted") === "true";
    const idDocumentFile = formData.get("idDocument") as File | null;

    // Validate required fields
    if (!fullName || !phone || !country || !physicalAddress || !legalDeclarationAccepted) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Server-side field length limits
    if (fullName.length > 150 || phone.length > 30 || country.length > 100 || physicalAddress.length > 500) {
      return new Response(JSON.stringify({ error: "Field value too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upload ID document with server-side validation
    let idDocumentUrl: string | null = null;
    if (idDocumentFile && idDocumentFile.size > 0) {
      // Enforce server-side size limit
      if (idDocumentFile.size > MAX_FILE_SIZE) {
        return new Response(JSON.stringify({ error: "File too large (max 5 MB)" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Read buffer and detect MIME type by magic numbers
      const buffer = new Uint8Array(await idDocumentFile.arrayBuffer());
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
      const safeName = sanitiseFilename(idDocumentFile.name.replace(/\.[^.]+$/, ""));
      const filePath = `${user.id}/${safeName}-${Date.now()}.${safeExt}`;

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

      idDocumentUrl = filePath;
    }

    // Update the user's profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        country,
        physical_address: physicalAddress,
        role: "sender",
        id_document_url: idDocumentUrl,
        legal_declaration_accepted: legalDeclarationAccepted,
      })
      .eq("auth_id", user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      return new Response(JSON.stringify({ error: "Failed to update profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
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
