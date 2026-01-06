import { useState } from "react";
import { CarrierFormData } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Step2Props {
  formData: CarrierFormData;
  updateFormData: (data: Partial<CarrierFormData>) => void;
  errors: Record<string, string>;
}

const Step2Compliance = ({ formData, updateFormData, errors }: Step2Props) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");

  const bbeeOptions = [
    "Level 1",
    "Level 2",
    "Level 3",
    "Level 4",
    "Level 5",
    "Non-Compliant",
    "Exempt Micro-Enterprise",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError("");

    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size must be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Only PDF, JPEG, and PNG files are allowed");
        return;
      }

      setUploadedFile(file);
      updateFormData({ insuranceCertificate: file.name });
    }
  };

  const isSouthAfrica = formData.country === "south-africa";

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">
          Licenses & Compliance
        </h2>
        <p className="text-muted-foreground">
          {isSouthAfrica 
            ? "Required for operating legally in South Africa and cross-border."
            : "Provide your business registration and licensing details."}
        </p>
      </div>

      {isSouthAfrica ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="cipcNumber">SA Company Registration Number (CIPC) *</Label>
            <Input
              id="cipcNumber"
              value={formData.cipcNumber}
              onChange={(e) => updateFormData({ cipcNumber: e.target.value })}
              placeholder="e.g., 2020/123456/07"
              className={errors.cipcNumber ? "border-destructive" : ""}
            />
            {errors.cipcNumber && (
              <p className="text-sm text-destructive mt-1">{errors.cipcNumber}</p>
            )}
          </div>

          <div>
            <Label htmlFor="taxVatNumber">Tax / VAT Number *</Label>
            <Input
              id="taxVatNumber"
              value={formData.taxVatNumber}
              onChange={(e) => updateFormData({ taxVatNumber: e.target.value })}
              placeholder="e.g., 4123456789"
              className={errors.taxVatNumber ? "border-destructive" : ""}
            />
            {errors.taxVatNumber && (
              <p className="text-sm text-destructive mt-1">{errors.taxVatNumber}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="businessRegistrationNumber">Business Registration Number *</Label>
            <Input
              id="businessRegistrationNumber"
              value={formData.businessRegistrationNumber}
              onChange={(e) => updateFormData({ businessRegistrationNumber: e.target.value })}
              placeholder="Your company registration number"
              className={errors.businessRegistrationNumber ? "border-destructive" : ""}
            />
            {errors.businessRegistrationNumber && (
              <p className="text-sm text-destructive mt-1">{errors.businessRegistrationNumber}</p>
            )}
          </div>

          <div>
            <Label htmlFor="taxVatNumber">Tax Registration Number</Label>
            <Input
              id="taxVatNumber"
              value={formData.taxVatNumber}
              onChange={(e) => updateFormData({ taxVatNumber: e.target.value })}
              placeholder="If applicable"
            />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="transportLicenseNumber">
            {isSouthAfrica ? "Transport Operating License (OL) Number *" : "Transport License Number"}
          </Label>
          <Input
            id="transportLicenseNumber"
            value={formData.transportLicenseNumber}
            onChange={(e) => updateFormData({ transportLicenseNumber: e.target.value })}
            placeholder={isSouthAfrica ? "Your OL number" : "Transport license if applicable"}
            className={errors.transportLicenseNumber ? "border-destructive" : ""}
          />
          {errors.transportLicenseNumber && (
            <p className="text-sm text-destructive mt-1">{errors.transportLicenseNumber}</p>
          )}
        </div>

        {isSouthAfrica && (
          <div>
            <Label htmlFor="pdpHolders">PDP Holders *</Label>
            <Input
              id="pdpHolders"
              type="number"
              min={1}
              value={formData.pdpHolders}
              onChange={(e) => updateFormData({ pdpHolders: parseInt(e.target.value) || 1 })}
              placeholder="Number of drivers with valid PDPs"
              className={errors.pdpHolders ? "border-destructive" : ""}
            />
            <p className="text-xs text-muted-foreground mt-1">
              How many drivers hold valid Public Driver's Permits?
            </p>
            {errors.pdpHolders && (
              <p className="text-sm text-destructive mt-1">{errors.pdpHolders}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <Label className="mb-3 block">Cross-Border Operations? *</Label>
        <RadioGroup
          value={formData.crossBorderOperations}
          onValueChange={(value) => updateFormData({ crossBorderOperations: value as any })}
          className="flex gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="cross-yes" />
            <Label htmlFor="cross-yes" className="cursor-pointer font-normal">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="cross-no" />
            <Label htmlFor="cross-no" className="cursor-pointer font-normal">
              No
            </Label>
          </div>
        </RadioGroup>
        {errors.crossBorderOperations && (
          <p className="text-sm text-destructive mt-1">{errors.crossBorderOperations}</p>
        )}
      </div>

      <AnimatePresence>
        {formData.crossBorderOperations === "yes" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Label htmlFor="crossBorderCountries">Countries Permitted to Operate In</Label>
            <Textarea
              id="crossBorderCountries"
              value={formData.crossBorderCountries}
              onChange={(e) => updateFormData({ crossBorderCountries: e.target.value })}
              placeholder="e.g., Namibia, Botswana, Zimbabwe, Mozambique, Zambia"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              List all countries you are permitted/registered to operate in
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <Label className="mb-2 block">Insurance for Public Liability and/or Goods in Transit *</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Upload a current, valid insurance certificate. Max 5MB, PDF/JPEG/PNG.
        </p>
        
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            uploadedFile
              ? "border-primary bg-primary/5"
              : uploadError
              ? "border-destructive bg-destructive/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {uploadedFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileCheck className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-medium text-foreground">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">PDF, JPEG, or PNG (max 5MB)</p>
            </div>
          )}
        </div>
        
        {uploadError && (
          <div className="flex items-center gap-2 mt-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{uploadError}</p>
          </div>
        )}
      </div>

      {isSouthAfrica && (
        <div>
          <Label htmlFor="bbeeStatus">B-BBEE Status Level</Label>
          <Select
            value={formData.bbeeStatus}
            onValueChange={(value) => updateFormData({ bbeeStatus: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select B-BBEE status (optional)" />
            </SelectTrigger>
            <SelectContent>
              {bbeeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Optional but beneficial for certain contracts
          </p>
        </div>
      )}
    </div>
  );
};

export default Step2Compliance;
