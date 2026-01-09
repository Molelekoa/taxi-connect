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
import {
  User,
  CreditCard,
  Car,
  MapPin,
  CheckCircle,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

interface Step5Props {
  formData: CarrierFormData;
  updateFormData: (data: Partial<CarrierFormData>) => void;
  errors: Record<string, string>;
}

const Step5Review = ({ formData, updateFormData, errors }: Step5Props) => {
  const referralOptions = [
    "Google / Search Engine",
    "Facebook / Social Media",
    "Friend / Family Referral",
    "Existing Driver Referral",
    "Job Board / Advertisement",
    "Other",
  ];

  const formatLicenseType = (type: string) => {
    const types: Record<string, string> = {
      "code-a": "Code A (Motorcycle)",
      "code-b": "Code B (Light Motor Vehicle)",
      "code-c1": "Code C1 (Light Heavy Vehicle)",
      "code-c": "Code C (Heavy Vehicle)",
      "code-eb": "Code EB (Light Vehicle with Trailer)",
      "code-ec1": "Code EC1 (Articulated Vehicle up to 16,000 kg)",
      "code-ec": "Code EC (Articulated Heavy Vehicle)",
    };
    return types[type] || type;
  };

  const formatVehicleType = (type: string) => {
    const types: Record<string, string> = {
      motorcycle: "Motorcycle/Scooter",
      hatchback: "Hatchback",
      sedan: "Sedan",
      suv: "SUV/Crossover",
      bakkie: "Bakkie/Pickup",
      minivan: "Minivan/Kombi",
      "panel-van": "Panel Van",
      "small-truck": "Small Truck (1-3 ton)",
    };
    return types[type] || type;
  };

  const formatRegion = (region: string) => {
    return region
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const cargoLabels: Record<string, string> = {
    documents: "Documents & Paperwork",
    electronics: "Electronic Devices",
    medication: "Medication & Pharmacy",
    automotive: "Automotive Parts",
    clothing: "Clothing & Apparel",
    "food-ambient": "Food (Non-perishable)",
    gifts: "Gifts & Personal Items",
    books: "Books & Printed Materials",
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-primary" />
          Review Your Application
        </h2>
        <p className="text-muted-foreground">
          Please review your information before submitting. You can go back to make changes.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Personal Info */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Personal Information
          </h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {formData.fullName}</p>
            <p><span className="text-muted-foreground">ID:</span> {formData.idNumber}</p>
            <p><span className="text-muted-foreground">Email:</span> {formData.email}</p>
            <p><span className="text-muted-foreground">Phone:</span> {formData.phone}</p>
            <p className="md:col-span-2"><span className="text-muted-foreground">Address:</span> {formData.physicalAddress}</p>
          </div>
        </div>

        {/* License Info */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Driver's License
          </h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <p><span className="text-muted-foreground">License Type:</span> {formatLicenseType(formData.licenseType)}</p>
            <p><span className="text-muted-foreground">Years Licensed:</span> {formData.yearsWithLicense.replace("-", " - ")}</p>
            <p><span className="text-muted-foreground">ID Copy:</span> {formData.idCopyUploaded ? "✅ Uploaded" : "❌ Not uploaded"}</p>
            <p><span className="text-muted-foreground">License Copy:</span> {formData.licenseCopyUploaded ? "✅ Uploaded" : "❌ Not uploaded"}</p>
            <p className="md:col-span-2"><span className="text-muted-foreground">No Criminal Record:</span> {formData.noCriminalRecord ? "✅ Declared" : "❌ Not declared"}</p>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Car className="w-4 h-4 text-primary" />
            Vehicle Details
          </h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            <p><span className="text-muted-foreground">Type:</span> {formatVehicleType(formData.vehicleType)}</p>
            <p><span className="text-muted-foreground">Registration:</span> {formData.vehicleRegistration}</p>
            <p><span className="text-muted-foreground">Make/Model:</span> {formData.vehicleModel}</p>
            <p><span className="text-muted-foreground">Year:</span> {formData.vehicleYear}</p>
            <p><span className="text-muted-foreground">Colour:</span> {formData.vehicleColour}</p>
            <p><span className="text-muted-foreground">Capacity:</span> {formData.minLoadCapacity} - {formData.maxLoadCapacity} kg</p>
            <p className="md:col-span-2"><span className="text-muted-foreground">Insurance:</span> {formData.hasValidInsurance ? "✅ Confirmed" : "❌ Not confirmed"}</p>
          </div>
        </div>

        {/* Operations Info */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Operations
          </h3>
          <div className="text-sm space-y-2">
            <p><span className="text-muted-foreground">Primary Region:</span> {formatRegion(formData.primaryServiceRegion)}</p>
            {formData.additionalRegions && formData.additionalRegions.length > 0 && (
              <p><span className="text-muted-foreground">Additional Regions:</span> {formData.additionalRegions.map(formatRegion).join(", ")}</p>
            )}
            <p><span className="text-muted-foreground">Cargo Types:</span> {formData.cargoTypes?.map((c) => cargoLabels[c] || c).join(", ")}</p>
            <p className="pt-2 border-t border-border mt-2">
              <span className="text-muted-foreground">Emergency Contact:</span> {formData.emergencyContactName} ({formData.emergencyContactRelation}) - {formData.emergencyContactPhone}
            </p>
          </div>
        </div>
      </div>

      {/* Referral Source */}
      <div>
        <Label htmlFor="referralSource">How did you hear about CourierConnect? *</Label>
        <Select
          value={formData.referralSource}
          onValueChange={(value) => updateFormData({ referralSource: value })}
        >
          <SelectTrigger className={errors.referralSource ? "border-destructive" : ""}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {referralOptions.map((option) => (
              <SelectItem key={option} value={option.toLowerCase()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.referralSource && (
          <p className="text-sm text-destructive mt-1">{errors.referralSource}</p>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="termsAccepted"
            checked={formData.termsAccepted}
            onCheckedChange={(checked) =>
              updateFormData({ termsAccepted: checked === true })
            }
            className={errors.termsAccepted ? "border-destructive" : ""}
          />
          <div className="space-y-1">
            <Label
              htmlFor="termsAccepted"
              className="cursor-pointer font-medium flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-primary" />
              Accept Terms & Conditions *
            </Label>
            <p className="text-sm text-muted-foreground">
              I have read and agree to the CourierConnect{" "}
              <Link to="/terms-of-service" className="text-primary hover:underline" target="_blank">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">
                Privacy Policy
              </Link>
              . I confirm that all information provided is accurate and complete.
            </p>
          </div>
        </div>
        {errors.termsAccepted && (
          <p className="text-sm text-destructive mt-2">{errors.termsAccepted}</p>
        )}
      </div>
    </div>
  );
};

export default Step5Review;
