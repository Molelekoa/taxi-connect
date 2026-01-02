import { z } from "zod";

// Step 1: Company & Primary Contact
export const step1Schema = z.object({
  legalBusinessName: z.string().min(2, "Legal business name is required"),
  tradingName: z.string().optional(),
  businessType: z.enum(["owner-operator", "small-fleet", "midsize-fleet", "large-fleet"], {
    required_error: "Please select your business type",
  }),
  yearsInOperation: z.string().min(1, "Please select years in operation"),
  primaryContactPerson: z.string().min(2, "Contact person name is required"),
  contactTitle: z.string().min(2, "Contact title is required"),
  directPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d\s\-\(\)\+]+$/, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email address"),
  physicalAddress: z.string().min(5, "Physical address is required"),
  website: z.string().optional(),
});

// Step 2: Compliance & Licensing
export const step2Schema = z.object({
  cipcNumber: z.string().min(5, "CIPC registration number is required"),
  taxVatNumber: z.string().min(5, "Tax/VAT number is required"),
  transportLicenseNumber: z.string().min(5, "Transport Operating License number is required"),
  pdpHolders: z.number().min(1, "At least 1 PDP holder is required"),
  crossBorderOperations: z.enum(["yes", "no"], {
    required_error: "Please indicate cross-border operations",
  }),
  crossBorderCountries: z.string().optional(),
  insuranceCertificate: z.string().optional(), // Will store file name/path
  bbeeStatus: z.string().optional(),
});

// Vehicle photos schema
export const vehiclePhotosSchema = z.object({
  front: z.string().optional(),
  side: z.string().optional(),
  back: z.string().optional(),
});

// Vehicle entry for Step 3
export const vehicleSchema = z.object({
  id: z.string(),
  vehicleType: z.string().min(1, "Vehicle type is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  minPayloadCapacity: z.string().min(1, "Minimum payload capacity is required"),
  maxPayloadCapacity: z.string().min(1, "Maximum payload capacity is required"),
  dimensionLength: z.string().min(1, "Length is required"),
  dimensionWidth: z.string().min(1, "Width is required"),
  dimensionHeight: z.string().min(1, "Height is required"),
  features: z.array(z.string()).optional(),
  photos: vehiclePhotosSchema.optional(),
});

export type VehiclePhotos = z.infer<typeof vehiclePhotosSchema>;

// Step 3: Fleet Details
export const step3Schema = z.object({
  vehicles: z.array(vehicleSchema).min(1, "At least one vehicle is required"),
  trailerPreference: z.enum(["frequently", "if-needed", "no"], {
    required_error: "Please select trailer preference",
  }),
});

// Step 4: Operations
export const step4Schema = z.object({
  serviceRegions: z.array(z.string()).min(1, "Select at least one service region"),
  preferredRoutes: z.string().optional(),
  cargoTypes: z.array(z.string()).min(1, "Select at least one cargo type"),
  hazmatCertNumber: z.string().optional(),
  loadPreference: z.string().optional(),
  rateBasis: z.array(z.string()).optional(),
});

// Step 5: Review (just referral source)
export const step5Schema = z.object({
  referralSource: z.string().min(1, "Please tell us how you heard about us"),
});

// Full form schema
export const fullCarrierSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type VehicleEntry = z.infer<typeof vehicleSchema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type CarrierFormData = z.infer<typeof fullCarrierSchema>;

export const initialFormData: CarrierFormData = {
  // Step 1
  legalBusinessName: "",
  tradingName: "",
  businessType: "owner-operator",
  yearsInOperation: "",
  primaryContactPerson: "",
  contactTitle: "",
  directPhone: "",
  email: "",
  physicalAddress: "",
  website: "",
  // Step 2
  cipcNumber: "",
  taxVatNumber: "",
  transportLicenseNumber: "",
  pdpHolders: 1,
  crossBorderOperations: "no",
  crossBorderCountries: "",
  insuranceCertificate: "",
  bbeeStatus: "",
  // Step 3
  vehicles: [
    {
      id: crypto.randomUUID(),
      vehicleType: "",
      quantity: 1,
      minPayloadCapacity: "",
      maxPayloadCapacity: "",
      dimensionLength: "",
      dimensionWidth: "",
      dimensionHeight: "",
      features: [],
      photos: { front: "", side: "", back: "" },
    },
  ],
  trailerPreference: "no",
  // Step 4
  serviceRegions: [],
  preferredRoutes: "",
  cargoTypes: [],
  hazmatCertNumber: "",
  loadPreference: "",
  rateBasis: [],
  // Step 5
  referralSource: "",
};
