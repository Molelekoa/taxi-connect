import { z } from "zod";

// Step 1: Contact & Shipment Basics
export const step1Schema = z.object({
  contactName: z.string().min(2, "Name must be at least 2 characters"),
  companyName: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^[\d\s\-\+\(\)]{10,}$/, "Please enter a valid phone number"),
  loadDescription: z.string().min(5, "Please describe your load"),
  shipmentType: z.string().min(1, "Please select a shipment type"),
});

// Step 2: Locations & Dates
export const step2Schema = z.object({
  pickupAddress: z.string().min(5, "Please enter pickup address"),
  pickupDate: z.string().optional(),
  pickupLocationType: z.string().min(1, "Please select location type"),
  deliveryAddress: z.string().min(5, "Please enter delivery address"),
  deliveryDate: z.string().optional(),
  deliveryLocationType: z.string().min(1, "Please select location type"),
});

// Step 3: Load Specifications
export const step3Schema = z.object({
  weight: z.string().min(1, "Please enter weight"),
  dimensions: z.string().optional(),
  palletCount: z.string().optional(),
  commodityClass: z.string().optional(),
  stackable: z.enum(["yes", "no", ""]).optional(),
  liftgateRequired: z.enum(["yes", "no", "both", ""]).optional(),
});

// Step 4: Special Requirements (all optional)
export const step4Schema = z.object({
  hazmat: z.boolean().optional(),
  hazmatUN: z.string().optional(),
  hazmatClass: z.string().optional(),
  hazmatSDS: z.string().optional(),
  tempControlled: z.boolean().optional(),
  tempRange: z.string().optional(),
  tempType: z.string().optional(),
  international: z.boolean().optional(),
  countries: z.string().optional(),
  customsClearance: z.boolean().optional(),
  additionalInsurance: z.boolean().optional(),
  insuranceCoverage: z.string().optional(),
});

// Step 5: Review & Finalize
export const step5Schema = z.object({
  specialInstructions: z.string().optional(),
  referenceNumbers: z.string().optional(),
});

// Combined schema
export const fullQuoteSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

export type QuoteFormData = z.infer<typeof fullQuoteSchema>;

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
