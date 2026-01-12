import { CarrierFormData } from "./types";
import {
  User,
  CreditCard,
  Car,
  MapPin,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface Step5Props {
  formData: CarrierFormData;
  updateFormData: (data: Partial<CarrierFormData>) => void;
  errors: Record<string, string>;
}

const Step5Review = ({ formData }: Step5Props) => {
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

      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
              Please verify all details
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              It is your responsibility to ensure all details are accurate and complete. 
              Inaccurate information may delay your application processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Review;
