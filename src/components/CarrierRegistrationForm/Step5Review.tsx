import { CarrierFormData } from "./types";
import {
  User,
  CreditCard,
  Car,
  Route,
  Calendar,
  Package,
  CheckCircle,
  AlertTriangle,
  Users,
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

  const formatCity = (city: string) => {
    const cities: Record<string, string> = {
      johannesburg: "Johannesburg",
      pretoria: "Pretoria",
      durban: "Durban",
      "cape-town": "Cape Town",
      bloemfontein: "Bloemfontein",
      "port-elizabeth": "Port Elizabeth",
      "east-london": "East London",
      polokwane: "Polokwane",
      nelspruit: "Nelspruit",
      kimberley: "Kimberley",
      maseru: "Maseru (Lesotho)",
      harare: "Harare (Zimbabwe)",
      bulawayo: "Bulawayo (Zimbabwe)",
    };
    return cities[city] || city;
  };

  const formatFrequency = (freq: string) => {
    const frequencies: Record<string, string> = {
      daily: "Daily",
      "2-3-weekly": "2-3 times per week",
      weekly: "Weekly",
      fortnightly: "Fortnightly",
      monthly: "Monthly",
      occasionally: "Occasionally",
    };
    return frequencies[freq] || freq;
  };

  const formatScheduleType = (type: string) => {
    const types: Record<string, string> = {
      fixed: "Fixed days",
      somewhat: "Somewhat regular",
      varies: "Varies week to week",
    };
    return types[type] || type;
  };

  const formatDepartureTime = (time: string) => {
    const times: Record<string, string> = {
      "early-morning": "Early morning (before 8am)",
      morning: "Morning (8am - 12pm)",
      afternoon: "Afternoon (12pm - 5pm)",
      evening: "Evening (after 5pm)",
      varies: "Varies",
    };
    return times[time] || time;
  };

  const formatAdvanceNotice = (notice: string) => {
    const notices: Record<string, string> = {
      "same-day": "Same day",
      "24-hours": "24 hours",
      "2-3-days": "2-3 days",
      "1-week": "1 week or more",
    };
    return notices[notice] || notice;
  };

  const formatDays = (days: string[]) => {
    const dayLabels: Record<string, string> = {
      mon: "Mon",
      tue: "Tue",
      wed: "Wed",
      thu: "Thu",
      fri: "Fri",
      sat: "Sat",
      sun: "Sun",
    };
    return days.map((d) => dayLabels[d] || d).join(", ");
  };

  const formatReturnTrip = (value: string) => {
    const options: Record<string, string> = {
      yes: "Yes",
      no: "No",
      sometimes: "Sometimes",
    };
    return options[value] || value;
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

        {/* Routes & Schedule */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Route className="w-4 h-4 text-primary" />
            Routes & Schedule
          </h3>
          <div className="text-sm space-y-2">
            <p>
              <span className="text-muted-foreground">Primary Route:</span>{" "}
              {formatCity(formData.primaryRouteFrom)} → {formatCity(formData.primaryRouteTo)}
            </p>
            <p>
              <span className="text-muted-foreground">Return Trip:</span> {formatReturnTrip(formData.returnTrip)}
            </p>
            {formData.additionalRoutes && formData.additionalRoutes.length > 0 && (
              <p>
                <span className="text-muted-foreground">Additional Routes:</span>{" "}
                {formData.additionalRoutes
                  .filter((r) => r.from && r.to)
                  .map((r) => `${formatCity(r.from)} → ${formatCity(r.to)}`)
                  .join("; ")}
              </p>
            )}
            <div className="pt-2 border-t border-border/50 mt-2 grid md:grid-cols-2 gap-2">
              <p><span className="text-muted-foreground">Frequency:</span> {formatFrequency(formData.travelFrequency)}</p>
              <p><span className="text-muted-foreground">Schedule:</span> {formatScheduleType(formData.scheduleType)}</p>
              {formData.availableDays && formData.availableDays.length > 0 && (
                <p><span className="text-muted-foreground">Available Days:</span> {formatDays(formData.availableDays)}</p>
              )}
              <p><span className="text-muted-foreground">Departure:</span> {formatDepartureTime(formData.departureTime)}</p>
              <p><span className="text-muted-foreground">Notice Needed:</span> {formatAdvanceNotice(formData.advanceNotice)}</p>
            </div>
          </div>
        </div>

        {/* Capacity & Cargo */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Capacity & Parcel Types
          </h3>
          <div className="text-sm space-y-2">
            <p><span className="text-muted-foreground">Parcels per Trip:</span> {formData.parcelsPerTrip} parcels</p>
            {formData.storageType && (
              <p><span className="text-muted-foreground">Storage:</span> {formData.storageType === "dedicated" ? "Dedicated cargo area" : formData.storageType === "shared" ? "Shared with passenger space" : "Trailer/additional storage"}</p>
            )}
            <p><span className="text-muted-foreground">Parcel Types:</span> {formData.cargoTypes?.map((c) => cargoLabels[c] || c).join(", ")}</p>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Emergency Contact
          </h3>
          <div className="text-sm">
            <p>
              {formData.emergencyContactName} ({formData.emergencyContactRelation}) - {formData.emergencyContactPhone}
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