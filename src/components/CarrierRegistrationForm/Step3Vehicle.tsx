import { useState } from "react";
import { CarrierFormData } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Car, Shield, Scale, Upload, FileCheck, AlertCircle, Camera, Home } from "lucide-react";

interface Step3Props {
  formData: CarrierFormData;
  updateFormData: (data: Partial<CarrierFormData>) => void;
  errors: Record<string, string>;
  setFile?: (key: string, file: File | null) => void;
}

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024;

type UploadKey = "vehiclePhoto" | "licenseDisk" | "proofOfResidence";

const Step3Vehicle = ({ formData, updateFormData, errors, setFile }: Step3Props) => {
  const [files, setFiles] = useState<Record<UploadKey, File | null>>({
    vehiclePhoto: null,
    licenseDisk: null,
    proofOfResidence: null,
  });
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const vehicleTypes = [
    { value: "motorcycle", label: "Motorcycle/Scooter" },
    { value: "hatchback", label: "Hatchback" },
    { value: "sedan", label: "Sedan" },
    { value: "suv", label: "SUV/Crossover" },
    { value: "bakkie", label: "Bakkie/Pickup" },
    { value: "minivan", label: "Minivan/Kombi" },
    { value: "panel-van", label: "Panel Van" },
    { value: "small-truck", label: "Small Truck (1-3 ton)" },
  ];

  const ownershipTypes = [
    { value: "own", label: "I own this vehicle outright" },
    { value: "financed", label: "Financed / Under loan" },
    { value: "rented", label: "Rented / Leased" },
    { value: "company", label: "Company-owned vehicle" },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 25 }, (_, i) => currentYear - i);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: UploadKey) => {
    const file = e.target.files?.[0];
    const newErrors = { ...uploadErrors };
    delete newErrors[key];

    if (file) {
      if (file.size > MAX_SIZE) {
        newErrors[key] = "File size must be less than 5MB";
        setUploadErrors(newErrors);
        return;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        newErrors[key] = "Only PDF, JPEG, and PNG files are allowed";
        setUploadErrors(newErrors);
        return;
      }

      setFiles(prev => ({ ...prev, [key]: file }));
      const fieldMap: Record<UploadKey, keyof CarrierFormData> = {
        vehiclePhoto: "vehiclePhotoUploaded",
        licenseDisk: "licenseDiskUploaded",
        proofOfResidence: "proofOfResidenceUploaded",
      };
      updateFormData({ [fieldMap[key]]: file.name });
      setFile?.(key, file);
    }
    setUploadErrors(newErrors);
  };

  const renderUploadBox = (
    key: UploadKey,
    label: string,
    hint: string,
    icon: React.ReactNode,
    errorKey: string,
  ) => {
    const file = files[key];
    const hasError = errors[errorKey] || uploadErrors[key];

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
            onChange={(e) => handleFileUpload(e, key)}
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
              <p className="text-xs text-muted-foreground">{hint}</p>
            </div>
          )}
        </div>
        {(errors[errorKey] || uploadErrors[key]) && (
          <div className="flex items-center gap-2 mt-2 text-destructive">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">{errors[errorKey] || uploadErrors[key]}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2 flex items-center gap-2">
          <Car className="w-6 h-6 text-primary" />
          Vehicle Details
        </h2>
        <p className="text-muted-foreground">
          Tell us about the vehicle you'll use for deliveries.
        </p>
      </div>

      {/* Vehicle Ownership */}
      <div>
        <Label className="mb-3 block">Vehicle Ownership *</Label>
        <RadioGroup
          value={formData.vehicleOwnership}
          onValueChange={(value) => updateFormData({ vehicleOwnership: value as any })}
          className="grid sm:grid-cols-2 gap-3"
        >
          {ownershipTypes.map((type) => (
            <div
              key={type.value}
              className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                formData.vehicleOwnership === type.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value={type.value} id={`ownership-${type.value}`} />
              <Label htmlFor={`ownership-${type.value}`} className="cursor-pointer font-normal">
                {type.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.vehicleOwnership && (
          <p className="text-sm text-destructive mt-1">{errors.vehicleOwnership}</p>
        )}
      </div>

      {/* Vehicle Type & Registration */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="vehicleType">Vehicle Type *</Label>
          <Select
            value={formData.vehicleType}
            onValueChange={(value) => updateFormData({ vehicleType: value })}
          >
            <SelectTrigger className={errors.vehicleType ? "border-destructive" : ""}>
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              {vehicleTypes.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vehicleType && (
            <p className="text-sm text-destructive mt-1">{errors.vehicleType}</p>
          )}
        </div>

        <div>
          <Label htmlFor="vehicleRegistration">Registration Number *</Label>
          <Input
            id="vehicleRegistration"
            value={formData.vehicleRegistration}
            onChange={(e) => updateFormData({ vehicleRegistration: e.target.value.toUpperCase() })}
            placeholder="e.g., ABC 123 GP"
            className={errors.vehicleRegistration ? "border-destructive" : ""}
          />
          {errors.vehicleRegistration && (
            <p className="text-sm text-destructive mt-1">{errors.vehicleRegistration}</p>
          )}
        </div>
      </div>

      {/* Year, Make/Model, Colour */}
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="vehicleYear">Year *</Label>
          <Select
            value={formData.vehicleYear}
            onValueChange={(value) => updateFormData({ vehicleYear: value })}
          >
            <SelectTrigger className={errors.vehicleYear ? "border-destructive" : ""}>
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vehicleYear && (
            <p className="text-sm text-destructive mt-1">{errors.vehicleYear}</p>
          )}
        </div>

        <div>
          <Label htmlFor="vehicleModel">Make & Model *</Label>
          <Input
            id="vehicleModel"
            value={formData.vehicleModel}
            onChange={(e) => updateFormData({ vehicleModel: e.target.value })}
            placeholder="e.g., Toyota Hilux"
            className={errors.vehicleModel ? "border-destructive" : ""}
          />
          {errors.vehicleModel && (
            <p className="text-sm text-destructive mt-1">{errors.vehicleModel}</p>
          )}
        </div>

        <div>
          <Label htmlFor="vehicleColour">Colour *</Label>
          <Input
            id="vehicleColour"
            value={formData.vehicleColour}
            onChange={(e) => updateFormData({ vehicleColour: e.target.value })}
            placeholder="e.g., White"
            className={errors.vehicleColour ? "border-destructive" : ""}
          />
          {errors.vehicleColour && (
            <p className="text-sm text-destructive mt-1">{errors.vehicleColour}</p>
          )}
        </div>
      </div>

      {/* Load Capacity */}
      <div>
        <Label className="mb-3 block flex items-center gap-2">
          <Scale className="w-4 h-4 text-muted-foreground" />
          Load Capacity (kg)
        </Label>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="minLoadCapacity" className="text-sm text-muted-foreground">
              Minimum Load *
            </Label>
            <Input
              id="minLoadCapacity"
              value={formData.minLoadCapacity}
              onChange={(e) => updateFormData({ minLoadCapacity: e.target.value })}
              placeholder="e.g., 1"
              className={errors.minLoadCapacity ? "border-destructive" : ""}
            />
            {errors.minLoadCapacity && (
              <p className="text-sm text-destructive mt-1">{errors.minLoadCapacity}</p>
            )}
          </div>

          <div>
            <Label htmlFor="maxLoadCapacity" className="text-sm text-muted-foreground">
              Maximum Load *
            </Label>
            <Input
              id="maxLoadCapacity"
              value={formData.maxLoadCapacity}
              onChange={(e) => updateFormData({ maxLoadCapacity: e.target.value })}
              placeholder="e.g., 20"
              className={errors.maxLoadCapacity ? "border-destructive" : ""}
            />
            {errors.maxLoadCapacity && (
              <p className="text-sm text-destructive mt-1">{errors.maxLoadCapacity}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          For Parcolo parcels, typical range is 1kg to 50kg
        </p>
      </div>

      {/* Insurance Declaration */}
      <div className="p-4 rounded-lg bg-secondary/50 border border-border">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="hasValidInsurance"
            checked={formData.hasValidInsurance}
            onCheckedChange={(checked) =>
              updateFormData({ hasValidInsurance: checked === true })
            }
            className={errors.hasValidInsurance ? "border-destructive" : ""}
          />
          <div className="space-y-1">
            <Label
              htmlFor="hasValidInsurance"
              className="cursor-pointer font-medium flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-primary" />
              Valid Vehicle Insurance Declaration *
            </Label>
            <p className="text-sm text-muted-foreground">
              I confirm that my vehicle has valid, up-to-date insurance (at minimum, 
              third-party coverage). I understand I may be asked to provide proof of insurance.
            </p>
          </div>
        </div>
        {errors.hasValidInsurance && (
          <p className="text-sm text-destructive mt-2">{errors.hasValidInsurance}</p>
        )}
      </div>

      {/* Document Uploads */}
      <div className="space-y-4">
        <h3 className="font-display font-semibold text-lg text-foreground border-b border-border pb-2 flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Vehicle Verification Documents
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload the following documents so our team can verify your vehicle and identity.
        </p>

        {renderUploadBox(
          "vehiclePhoto",
          "Vehicle Photo",
          "Upload a clear photo of your vehicle (JPEG or PNG, max 5MB)",
          <Camera className="w-4 h-4 text-muted-foreground" />,
          "vehiclePhotoUploaded",
        )}

        {renderUploadBox(
          "licenseDisk",
          "License Disk on Windscreen",
          "Photo of the license disk visible on the windscreen (JPEG or PNG, max 5MB)",
          <Car className="w-4 h-4 text-muted-foreground" />,
          "licenseDiskUploaded",
        )}

        {renderUploadBox(
          "proofOfResidence",
          "Proof of Residence",
          "Utility bill, bank statement, or similar (PDF, JPEG, or PNG, max 5MB)",
          <Home className="w-4 h-4 text-muted-foreground" />,
          "proofOfResidenceUploaded",
        )}
      </div>
    </div>
  );
};

export default Step3Vehicle;
