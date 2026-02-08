import { z } from "zod";

export const senderSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(100),
  email: z.string().trim().email("Valid email is required").max(255),
  phone: z.string().trim().min(10, "Valid phone number required (10+ digits)").max(20),
  country: z.enum(["south-africa", "lesotho", "zimbabwe"], {
    errorMap: () => ({ message: "Please select your country" }),
  }),
  physicalAddress: z.string().trim().min(5, "Physical address is required").max(500),
  idDocumentName: z.string().min(1, "ID or Passport upload is required"),
  legalDeclarationAccepted: z.literal(true, {
    errorMap: () => ({ message: "You must accept the legal declaration to proceed" }),
  }),
});

export type SenderFormData = z.infer<typeof senderSchema>;
export type SenderFormInput = Partial<Omit<SenderFormData, "legalDeclarationAccepted"> & { legalDeclarationAccepted: boolean }>;
