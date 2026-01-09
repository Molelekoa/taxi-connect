import { useState } from "react";
import { CarrierFormData } from "./types";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileCheck, AlertCircle, CreditCard, ShieldCheck } from "lucide-react";

interface Step2Props {
  formData: CarrierFormData;
  updateFormData: (data: Partial<CarrierFormData>) => void;
  errors: Record<string, string>;
}

const Step2License = ({ formData, updateFormData, errors }: Step2Props) => {
  const [idFile, setIdFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const licenseTypes = [
    { value: "code-a", label: "Code A (Motorcycle)" },
    { value: "code-b", label: "Code B (Light Motor Vehicle)" },
    { value: "code-c1", label: "Code C1 (Light Heavy Vehicle up to 16,000 kg)" },
    { value: "code-c", label: "Code C (Heavy Vehicle over 16,000 kg)" },
    { value: "code-eb", label: "Code EB (Light Vehicle with Trailer)" },
    { value: "code-ec1", label: "Code EC1 (Articulated Vehicle up to 16,000 kg)" },
    { value: "code-ec", label: "Code EC (Articulated Heavy Vehicle)" },
  ];

  const yearsOptions = [
    { value: "less-than-1", label: "Less than 1 year" },
    { value: "1-2", label: "1-2 years" },
    { value: "3-5", label: "3-5 years" },
    { value: "6-10", label: "6-10 years" },
    { value: "10-plus", label: "10+ years" },
  ];

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "id" | "license"
  ) => {
    const file = e.target.files?.[0];
    const newErrors = { ...uploadErrors };
    delete newErrors[type];

    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        newErrors[type] = "File size must be less than 5MB";
        setUploadErrors(newErrors);
        return;
      }

      // Validate file type
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        newErrors[type] = "Only PDF, JPEG, and PNG files are allowed";
        setUploadErrors(newErrors);
        return;
      }

      if (type === "id") {
        setIdFile(file);
        updateFormData({ idCopyUploaded: file.name });
      } else {
        setLicenseFile(file);
        updateFormData({ licenseCopyUploaded: file.name });
      }
    }

    setUploadErrors(newErrors);
  };

  const renderUploadBox = (
    type: "id" | "license",
    file: File | null,
    label: string,
    icon: React.ReactNode
  ) => {
    const errorKey = type === "id" ? "idCopyUploaded" : "licenseCopyUploaded";
    const hasError = errors[errorKey] || uploadErrors[type];

    return (
      <div>
        <Label className="mb-2 block flex items-center gap-2">
          {icon}
          {label} *
        </Label>
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            file
              ? "border-primary bg-primary/5"
              : hasError
              ? "border-destructive bg-destructive/5"
              : "border-border hover:border-primary/50"
          }`}
        >
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => handleFileUpload(e, type)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileCheck className="w-8 h-8 text-primary" />
              <div className="text-left">
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
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

        {(errors[errorKey] || uploadErrors[type]) && (
          <div className="flex items-center gap-2 mt-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{errors[errorKey] || uploadErrors[type]}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          Driver's License & Documentation
        </h2>
        <p className="text-muted-foreground">
          Provide your driver's license details and upload copies of your ID and license.
        </p>
      </div>

      {/* License Type & Years */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="licenseType">Driver's License Type *</Label>
          <Select
            value={formData.licenseType}
            onValueChange={(value) => updateFormData({ licenseType: value })}
          >
            <SelectTrigger className={errors.licenseType ? "border-destructive" : ""}>
              <SelectValue placeholder="Select license type" />
            </SelectTrigger>
            <SelectContent>
              {licenseTypes.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.licenseType && (
            <p className="text-sm text-destructive mt-1">{errors.licenseType}</p>
          )}
        </div>

        <div>
          <Label htmlFor="yearsWithLicense">Years with Valid License *</Label>
          <Select
            value={formData.yearsWithLicense}
            onValueChange={(value) => updateFormData({ yearsWithLicense: value })}
          >
            <SelectTrigger className={errors.yearsWithLicense ? "border-destructive" : ""}>
              <SelectValue placeholder="Select years" />
            </SelectTrigger>
            <SelectContent>
              {yearsOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.yearsWithLicense && (
            <p className="text-sm text-destructive mt-1">{errors.yearsWithLicense}</p>
          )}
        </div>
      </div>

      {/* Document Uploads */}
      <div className="grid md:grid-cols-2 gap-6">
        {renderUploadBox(
          "id",
          idFile,
          "Copy of ID Document",
          <CreditCard className="w-4 h-4 text-muted-foreground" />
        )}
        {renderUploadBox(
          "license",
          licenseFile,
          "Copy of Driver's License",
          <CreditCard className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Criminal Record Declaration */}
      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="noCriminalRecord"
            checked={formData.noCriminalRecord}
            onCheckedChange={(checked) =>
              updateFormData({ noCriminalRecord: checked === true })
            }
            className={errors.noCriminalRecord ? "border-destructive" : ""}
          />
          <div className="space-y-1">
            <Label
              htmlFor="noCriminalRecord"
              className="cursor-pointer font-medium flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-primary" />
              No Criminal Record Declaration *
            </Label>
            <p className="text-sm text-muted-foreground">
              I hereby declare that I have no criminal record that would prevent me from 
              performing courier duties. I understand that false declarations may result 
              in immediate termination.
            </p>
          </div>
        </div>
        {errors.noCriminalRecord && (
          <p className="text-sm text-destructive mt-2">{errors.noCriminalRecord}</p>
        )}
      </div>
    </div>
  );
};

export default Step2License;
