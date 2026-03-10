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

const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

async function validateAndUploadFile(
  supabaseAdmin: ReturnType<typeof createClient>,
  file: File,
  userId: string,
  prefix: string,
): Promise<{ path: string | null; error: string | null }> {
  if (file.size === 0) return { path: null, error: null };

  if (file.size > MAX_FILE_SIZE) {
    return { path: null, error: "File too large (max 5 MB)" };
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const detectedMime = detectMimeType(buffer);

  if (!detectedMime) {
    return { path: null, error: "Invalid file type. Only PDF, JPEG, or PNG are allowed." };
  }

  const safeExt = MIME_TO_EXT[detectedMime];
  const safeName = sanitiseFilename(file.name.replace(/\.[^.]+$/, ""));
  const filePath = `${userId}/${prefix}-${safeName}-${Date.now()}.${safeExt}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("documents")
    .upload(filePath, buffer, { upsert: true, contentType: detectedMime });

  if (uploadError) {
    console.error(`Upload error [${prefix}]:`, uploadError);
    return { path: null, error: "Failed to upload document" };
  }

  return { path: filePath, error: null };
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

    // Parse multipart form data
    const formData = await req.formData();

    // Personal info
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const country = formData.get("country") as string;
    const physicalAddress = formData.get("physicalAddress") as string;

    // Server-side required field validation
    if (!fullName || !phone || !country || !physicalAddress) {
      return new Response(JSON.stringify({ error: "Missing required personal fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Server-side field length limits
    if (
      fullName.length > 150 ||
      phone.length > 30 ||
      country.length > 100 ||
      physicalAddress.length > 500
    ) {
      return new Response(JSON.stringify({ error: "Field value too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // License info
    const licenseType = formData.get("licenseType") as string;
    const yearsWithLicense = formData.get("yearsWithLicense") as string;
    const noCriminalRecord = formData.get("noCriminalRecord") === "true";

    // Vehicle info
    const vehicleOwnership = formData.get("vehicleOwnership") as string;
    const vehicleType = formData.get("vehicleType") as string;
    const vehicleRegistration = formData.get("vehicleRegistration") as string;
    const vehicleYear = formData.get("vehicleYear") as string;
    const vehicleModel = formData.get("vehicleModel") as string;
    const vehicleColour = formData.get("vehicleColour") as string;
    const minLoadCapacity = formData.get("minLoadCapacity") as string;
    const maxLoadCapacity = formData.get("maxLoadCapacity") as string;
    const hasValidInsurance = formData.get("hasValidInsurance") === "true";

    // Operations info
    const travelFrequency = formData.get("travelFrequency") as string;
    const scheduleType = formData.get("scheduleType") as string;
    const availableDaysRaw = formData.get("availableDays") as string;
    let availableDays: string[] = [];
    try { availableDays = availableDaysRaw ? JSON.parse(availableDaysRaw) : []; } catch { availableDays = []; }
    if (!Array.isArray(availableDays) || availableDays.length > 7) {
      return new Response(JSON.stringify({ error: "Invalid availableDays" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const departureTime = formData.get("departureTime") as string;
    const advanceNotice = formData.get("advanceNotice") as string;
    const parcelsPerTrip = formData.get("parcelsPerTrip") as string;
    const storageType = formData.get("storageType") as string;
    const cargoTypesRaw = formData.get("cargoTypes") as string;
    let cargoTypes: string[] = [];
    try { cargoTypes = cargoTypesRaw ? JSON.parse(cargoTypesRaw) : []; } catch { cargoTypes = []; }
    if (!Array.isArray(cargoTypes) || cargoTypes.length > 20) {
      return new Response(JSON.stringify({ error: "Invalid cargoTypes" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const emergencyContactName = formData.get("emergencyContactName") as string;
    const emergencyContactRelation = formData.get("emergencyContactRelation") as string;
    const emergencyContactPhone = formData.get("emergencyContactPhone") as string;
    const referralSource = formData.get("referralSource") as string;

    // Routes
    const routeFromPrimary = formData.get("routeFromPrimary") as string;
    const routeToPrimary = formData.get("routeToPrimary") as string;
    const returnTrip = formData.get("returnTrip") as string;
    const additionalRoutesRaw = formData.get("additionalRoutes") as string;
    let additionalRoutes: Array<{ from: string; to: string; returnTrip: string }> = [];
    try { additionalRoutes = additionalRoutesRaw ? JSON.parse(additionalRoutesRaw) : []; } catch { additionalRoutes = []; }
    if (!Array.isArray(additionalRoutes) || additionalRoutes.length > 10) {
      return new Response(JSON.stringify({ error: "Invalid additionalRoutes (max 10)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Files — validate and upload with server-side checks
    const idCopyFile = formData.get("idCopy") as File | null;
    const licenseCopyFile = formData.get("licenseCopy") as File | null;
    const vehiclePhotoFile = formData.get("vehiclePhoto") as File | null;
    const licenseDiskFile = formData.get("licenseDisk") as File | null;
    const proofOfResidenceFile = formData.get("proofOfResidence") as File | null;

    let idCopyUrl: string | null = null;
    let licenseCopyUrl: string | null = null;
    let vehiclePhotoUrl: string | null = null;
    let licenseDiskUrl: string | null = null;
    let proofOfResidenceUrl: string | null = null;

    // Upload all files
    const fileUploads: Array<{ file: File | null; prefix: string; setter: (v: string | null) => void }> = [
      { file: idCopyFile, prefix: "id-copy", setter: (v) => { idCopyUrl = v; } },
      { file: licenseCopyFile, prefix: "license-copy", setter: (v) => { licenseCopyUrl = v; } },
      { file: vehiclePhotoFile, prefix: "vehicle-photo", setter: (v) => { vehiclePhotoUrl = v; } },
      { file: licenseDiskFile, prefix: "license-disk", setter: (v) => { licenseDiskUrl = v; } },
      { file: proofOfResidenceFile, prefix: "proof-of-residence", setter: (v) => { proofOfResidenceUrl = v; } },
    ];

    for (const { file, prefix, setter } of fileUploads) {
      if (file && file.size > 0) {
        const result = await validateAndUploadFile(supabaseAdmin, file, user.id, prefix);
        if (result.error) {
          return new Response(JSON.stringify({ error: result.error }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        setter(result.path);
      }
    }

    // Update profile
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        country,
        physical_address: physicalAddress,
        role: "traveler",
        legal_declaration_accepted: true,
      })
      .eq("auth_id", user.id)
      .select("id")
      .single();

    if (profileError || !profileData) {
      console.error("Profile update error:", profileError);
      return new Response(JSON.stringify({ error: "Failed to update profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create traveler profile
    const { data: tpData, error: tpError } = await supabaseAdmin
      .from("traveler_profiles")
      .insert({
        profile_id: profileData.id,
        license_type: licenseType,
        years_with_license: yearsWithLicense,
        no_criminal_record: noCriminalRecord,
        id_copy_url: idCopyUrl,
        license_copy_url: licenseCopyUrl,
        vehicle_photo_url: vehiclePhotoUrl,
        license_disk_url: licenseDiskUrl,
        proof_of_residence_url: proofOfResidenceUrl,
        vehicle_ownership: vehicleOwnership,
        vehicle_type: vehicleType,
        vehicle_registration: vehicleRegistration,
        vehicle_year: vehicleYear,
        vehicle_model: vehicleModel,
        vehicle_colour: vehicleColour,
        min_load_capacity: minLoadCapacity,
        max_load_capacity: maxLoadCapacity,
        has_valid_insurance: hasValidInsurance,
        travel_frequency: travelFrequency,
        schedule_type: scheduleType,
        available_days: availableDays,
        departure_time: departureTime,
        advance_notice: advanceNotice,
        parcels_per_trip: parcelsPerTrip,
        storage_type: storageType,
        cargo_types: cargoTypes,
        emergency_contact_name: emergencyContactName,
        emergency_contact_relation: emergencyContactRelation,
        emergency_contact_phone: emergencyContactPhone,
        referral_source: referralSource,
      })
      .select("id")
      .single();

    if (tpError || !tpData) {
      console.error("Traveler profile insert error:", tpError);
      return new Response(JSON.stringify({ error: "Failed to create traveler profile" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create routes
    const routesToInsert = [
      { traveler_profile_id: tpData.id, route_from: routeFromPrimary, route_to: routeToPrimary, return_trip: returnTrip, is_primary: true },
      ...additionalRoutes.map((r: { from: string; to: string; returnTrip: string }) => ({
        traveler_profile_id: tpData.id,
        route_from: r.from,
        route_to: r.to,
        return_trip: r.returnTrip,
        is_primary: false,
      })),
    ].filter((r) => r.route_from && r.route_to);

    if (routesToInsert.length > 0) {
      const { error: routesError } = await supabaseAdmin
        .from("traveler_routes")
        .insert(routesToInsert);

      if (routesError) {
        console.error("Routes insert error:", routesError);
      }
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
