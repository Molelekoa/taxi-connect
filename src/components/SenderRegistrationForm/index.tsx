import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, FileCheck, X, CheckCircle, Shield } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { senderSchema, type SenderFormInput } from "./types";

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const COUNTRIES = [
  { value: "south-africa", label: "South Africa" },
  { value: "lesotho", label: "Lesotho" },
  { value: "zimbabwe", label: "Zimbabwe" },
];

const SenderRegistrationForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<SenderFormInput>({
    fullName: "",
    email: "",
    phone: "",
    country: undefined,
    physicalAddress: "",
    idDocumentName: "",
    legalDeclarationAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [idUploadError, setIdUploadError] = useState("");
  const idInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof SenderFormInput, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleIdUpload = (file: File | null) => {
    setIdUploadError("");
    if (!file) {
      setIdDocumentFile(null);
      setFormData((prev) => ({ ...prev, idDocumentName: "" }));
      return;
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setIdUploadError("Please upload a PDF, JPEG, or PNG file");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setIdUploadError("File size must be less than 5MB");
      return;
    }
    setIdDocumentFile(file);
    setFormData((prev) => ({ ...prev, idDocumentName: file.name }));
    if (errors.idDocumentName) setErrors((prev) => ({ ...prev, idDocumentName: "" }));
  };

  const removeIdDocument = () => {
    setIdDocumentFile(null);
    setFormData((prev) => ({ ...prev, idDocumentName: "" }));
    if (idInputRef.current) idInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      senderSchema.parse(formData);

      // Get session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("You must be logged in to register.");

      // Build multipart form
      const fd = new FormData();
      fd.append("fullName", formData.fullName ?? "");
      fd.append("phone", formData.phone ?? "");
      fd.append("country", formData.country ?? "");
      fd.append("physicalAddress", formData.physicalAddress ?? "");
      fd.append("legalDeclarationAccepted", String(formData.legalDeclarationAccepted));
      if (idDocumentFile) fd.append("idDocument", idDocumentFile);

      const { data, error } = await supabase.functions.invoke("register-sender", {
        body: fd,
      });

      if (error || !data?.success) throw new Error(error?.message || "Registration failed");

      setIsSuccess(true);
      toast({
        title: "Registration Submitted!",
        description: "Welcome to the Parcolo community.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Submission failed",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        className="bg-card border border-border rounded-xl p-8 md:p-12 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
        </motion.div>
        <h2 className="font-display font-bold text-2xl text-foreground mb-4">
          Welcome to the Community!
        </h2>
        <p className="text-muted-foreground mb-2">
          Your sender registration has been received.
        </p>
        <p className="text-muted-foreground">
          We'll verify your details and get you started shortly.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-foreground text-background p-6">
        <h2 className="font-display font-bold text-xl">Register as a Sender</h2>
        <p className="text-background/70 text-sm mt-1">
          Join the community to send parcels with trusted travelers.
        </p>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Personal Info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="sender-fullName">Full Name *</Label>
            <Input
              id="sender-fullName"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && <p className="text-destructive text-xs">{errors.fullName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sender-email">Email *</Label>
            <Input
              id="sender-email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sender-phone">Phone Number *</Label>
            <Input
              id="sender-phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="e.g., 082 123 4567"
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && <p className="text-destructive text-xs">{errors.phone}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="sender-country">Country *</Label>
            <Select
              value={formData.country}
              onValueChange={(v) => handleChange("country", v)}
            >
              <SelectTrigger className={errors.country ? "border-destructive" : ""}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && <p className="text-destructive text-xs">{errors.country}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sender-address">Physical Address *</Label>
          <Input
            id="sender-address"
            value={formData.physicalAddress}
            onChange={(e) => handleChange("physicalAddress", e.target.value)}
            placeholder="Street address, city, postal code"
            className={errors.physicalAddress ? "border-destructive" : ""}
          />
          {errors.physicalAddress && <p className="text-destructive text-xs">{errors.physicalAddress}</p>}
        </div>

        {/* ID Upload */}
        <div className="space-y-2">
          <Label>ID Document / Passport *</Label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              idDocumentFile
                ? "border-primary bg-primary/5"
                : errors.idDocumentName
                ? "border-destructive bg-destructive/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleIdUpload(file);
            }}
          >
            <input
              ref={idInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleIdUpload(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {idDocumentFile ? (
              <div className="flex items-center justify-center gap-3">
                <FileCheck className="w-5 h-5 text-primary" />
                <span className="text-sm text-foreground font-medium">{idDocumentFile.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeIdDocument();
                  }}
                  className="p-1 rounded-full hover:bg-destructive/10"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPEG, or PNG (max 5MB)</p>
              </>
            )}
          </div>
          {idUploadError && <p className="text-destructive text-xs">{idUploadError}</p>}
          {errors.idDocumentName && <p className="text-destructive text-xs">{errors.idDocumentName}</p>}
        </div>

        {/* Legal Declaration */}
        <div className="bg-secondary/50 border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-1">Legal Declaration *</h4>
              <p className="text-xs text-muted-foreground">
                Required for all senders to comply with cross-border regulations.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="sender-legal"
              checked={formData.legalDeclarationAccepted}
              onCheckedChange={(v) => handleChange("legalDeclarationAccepted", v === true)}
              className={errors.legalDeclarationAccepted ? "border-destructive" : ""}
            />
            <Label htmlFor="sender-legal" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
              I declare that any parcels I send will not contain items that are illegal, stolen,
              counterfeit, or prohibited under South African, Lesotho, or Zimbabwean law. I accept
              personal liability for any violations.
            </Label>
          </div>
          {errors.legalDeclarationAccepted && (
            <p className="text-destructive text-xs ml-7">{errors.legalDeclarationAccepted}</p>
          )}
        </div>

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Register as Sender"}
        </Button>
      </div>
    </motion.form>
  );
};

export default SenderRegistrationForm;
