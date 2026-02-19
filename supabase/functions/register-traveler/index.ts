import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      authHeader.replace("Bearer ", "")
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
    const availableDays = availableDaysRaw ? JSON.parse(availableDaysRaw) : [];
    const departureTime = formData.get("departureTime") as string;
    const advanceNotice = formData.get("advanceNotice") as string;
    const parcelsPerTrip = formData.get("parcelsPerTrip") as string;
    const storageType = formData.get("storageType") as string;
    const cargoTypesRaw = formData.get("cargoTypes") as string;
    const cargoTypes = cargoTypesRaw ? JSON.parse(cargoTypesRaw) : [];
    const emergencyContactName = formData.get("emergencyContactName") as string;
    const emergencyContactRelation = formData.get("emergencyContactRelation") as string;
    const emergencyContactPhone = formData.get("emergencyContactPhone") as string;
    const referralSource = formData.get("referralSource") as string;

    // Routes
    const routeFromPrimary = formData.get("routeFromPrimary") as string;
    const routeToPrimary = formData.get("routeToPrimary") as string;
    const returnTrip = formData.get("returnTrip") as string;
    const additionalRoutesRaw = formData.get("additionalRoutes") as string;
    const additionalRoutes = additionalRoutesRaw ? JSON.parse(additionalRoutesRaw) : [];

    // Files
    const idCopyFile = formData.get("idCopy") as File | null;
    const licenseCopyFile = formData.get("licenseCopy") as File | null;

    // Upload files
    let idCopyUrl: string | null = null;
    let licenseCopyUrl: string | null = null;

    if (idCopyFile && idCopyFile.size > 0) {
      const ext = idCopyFile.name.split(".").pop();
      const path = `${user.id}/id-copy-${Date.now()}.${ext}`;
      const { error } = await supabaseAdmin.storage.from("documents").upload(path, idCopyFile, { upsert: true });
      if (error) console.error("ID copy upload error:", error);
      else idCopyUrl = path;
    }

    if (licenseCopyFile && licenseCopyFile.size > 0) {
      const ext = licenseCopyFile.name.split(".").pop();
      const path = `${user.id}/license-copy-${Date.now()}.${ext}`;
      const { error } = await supabaseAdmin.storage.from("documents").upload(path, licenseCopyFile, { upsert: true });
      if (error) console.error("License copy upload error:", error);
      else licenseCopyUrl = path;
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
