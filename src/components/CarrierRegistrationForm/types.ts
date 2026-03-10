import { z } from "zod";

// Step 1: Personal Information
export const step1Schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  idNumber: z.string().min(6, "ID number is required"),
  passportNumber: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d\s\-\(\)\+]+$/, "Please enter a valid phone number"),
  physicalAddress: z.string().min(5, "Physical address is required"),
  country: z.enum(["south-africa", "lesotho", "zimbabwe"], {
    required_error: "Please select your country",
  }),
});

// Step 2: Driver & License Information
export const step2Schema = z.object({
  licenseType: z.string().min(1, "License type is required"),
  yearsWithLicense: z.string().min(1, "Please select years with license"),
  noCriminalRecord: z.boolean().refine((val) => val === true, {
    message: "You must declare no criminal record to proceed",
  }),
  idCopyUploaded: z.string().min(1, "ID copy is required"),
  licenseCopyUploaded: z.string().min(1, "Driver's license copy is required"),
});

// Step 3: Vehicle Details
export const step3Schema = z.object({
  vehicleOwnership: z.enum(["own", "financed", "rented", "company"], {
    required_error: "Please select vehicle ownership",
  }),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  vehicleRegistration: z.string().min(1, "Registration number is required"),
  vehicleYear: z.string().min(4, "Vehicle year is required"),
  vehicleModel: z.string().min(1, "Vehicle make/model is required"),
  vehicleColour: z.string().min(1, "Vehicle colour is required"),
  minLoadCapacity: z.string().min(1, "Minimum load capacity is required"),
  maxLoadCapacity: z.string().min(1, "Maximum load capacity is required"),
  hasValidInsurance: z.boolean().refine((val) => val === true, {
    message: "You must confirm valid vehicle insurance",
  }),
  vehiclePhotoUploaded: z.string().min(1, "Vehicle photo is required"),
  licenseDiskUploaded: z.string().min(1, "License disk photo is required"),
  proofOfResidenceUploaded: z.string().min(1, "Proof of residence is required"),
});

// Step 4: Operations & Preferences
export const step4Schema = z.object({
  // Route information
  primaryRouteFrom: z.string().min(1, "Please select your departure city"),
  primaryRouteTo: z.string().min(1, "Please select your destination city"),
  returnTrip: z.enum(["yes", "no", "sometimes"], {
    required_error: "Please select if you travel both directions",
  }),
  additionalRoutes: z.array(z.object({
    from: z.string(),
    to: z.string()
  })).optional(),
  
  // Schedule information
  travelFrequency: z.string().min(1, "Please select how often you travel"),
  scheduleType: z.enum(["fixed", "somewhat", "varies"], {
    required_error: "Please indicate your schedule type",
  }),
  availableDays: z.array(z.string()).optional(),
  departureTime: z.string().min(1, "Please select your typical departure time"),
  advanceNotice: z.string().min(1, "Please select how much notice you need"),
  
  // Capacity
  parcelsPerTrip: z.string().min(1, "Please select your capacity"),
  storageType: z.string().optional(),
  
  // Legacy fields (keeping for compatibility)
  primaryServiceRegion: z.string().optional(),
  additionalRegions: z.array(z.string()).optional(),
  cargoTypes: z.array(z.string()).min(1, "Select at least one cargo type"),
  emergencyContactName: z.string().min(2, "Emergency contact name is required"),
  emergencyContactRelation: z.string().min(1, "Relationship is required"),
  emergencyContactPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d\s\-\(\)\+]+$/, "Please enter a valid phone number"),
});

// Step 5: Review (no validation needed - just viewing data)
export const step5Schema = z.object({});

// Step 6: Confirm & Submit
export const step6Schema = z.object({
  referralSource: z.string().min(1, "Please tell us how you heard about us"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

// Full form schema
export const fullCarrierSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step6Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type CarrierFormData = z.infer<typeof fullCarrierSchema>;

export const initialFormData: CarrierFormData = {
  // Step 1 - Personal Info
  fullName: "",
  idNumber: "",
  passportNumber: "",
  email: "",
  phone: "",
  physicalAddress: "",
  country: "south-africa",
  // Step 2 - Driver & License
  licenseType: "",
  yearsWithLicense: "",
  noCriminalRecord: false,
  idCopyUploaded: "",
  licenseCopyUploaded: "",
  // Step 3 - Vehicle
  vehicleOwnership: "own",
  vehicleType: "",
  vehicleRegistration: "",
  vehicleYear: "",
  vehicleModel: "",
  vehicleColour: "",
  minLoadCapacity: "",
  maxLoadCapacity: "",
  hasValidInsurance: false,
  // Step 4 - Operations & Routes
  primaryRouteFrom: "",
  primaryRouteTo: "",
  returnTrip: "yes",
  additionalRoutes: [],
  travelFrequency: "",
  scheduleType: "fixed",
  availableDays: [],
  departureTime: "",
  advanceNotice: "",
  parcelsPerTrip: "",
  storageType: "",
  primaryServiceRegion: "",
  additionalRegions: [],
  cargoTypes: [],
  emergencyContactName: "",
  emergencyContactRelation: "",
  emergencyContactPhone: "",
  // Step 5 - Review
  referralSource: "",
  termsAccepted: false,
};
