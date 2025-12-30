import { CarrierFormData } from "./types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, FileCheck, Truck, MapPin, CheckCircle } from "lucide-react";

interface Step5Props {
  formData: CarrierFormData;
  updateFormData: (data: Partial<CarrierFormData>) => void;
  errors: Record<string, string>;
}

const referralSources = [
  "Google Search",
  "Referral from Another Carrier",
  "Industry Event / Trade Show",
  "Social Media",
  "Load Board",
  "Other",
];

const Step5Review = ({ formData, updateFormData, errors }: Step5Props) => {
  const businessTypeLabels: Record<string, string> = {
    "owner-operator": "Owner-Operator",
    "small-fleet": "Small Fleet (1-5 vehicles)",
    "midsize-fleet": "Midsize Fleet (6-25 vehicles)",
    "large-fleet": "Large Fleet (25+ vehicles)",
  };

  const regionLabels: Record<string, string> = {
    gauteng: "Gauteng",
    "western-cape": "Western Cape",
    "kwazulu-natal": "KwaZulu-Natal",
    "eastern-cape": "Eastern Cape",
    "free-state": "Free State",
    "cross-border": "Cross-Border (SADC)",
    national: "National Coverage",
  };

  const cargoLabels: Record<string, string> = {
    "general-freight": "General Freight",
    hazardous: "Hazardous Materials",
    perishables: "Perishables",
    "high-value": "High-Value Goods",
    automotive: "Automotive Parts",
    bulk: "Bulk Materials",
    livestock: "Live Animals",
    other: "Other",
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">
          Review & Finish
        </h2>
        <p className="text-muted-foreground">
          Please verify your information before submitting.
        </p>
      </div>

      {/* Company Summary */}
      <div className="p-5 rounded-xl border border-border bg-secondary/30">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Company Information</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Legal Name:</span>
            <p className="text-foreground font-medium">{formData.legalBusinessName}</p>
          </div>
          {formData.tradingName && (
            <div>
              <span className="text-muted-foreground">Trading As:</span>
              <p className="text-foreground font-medium">{formData.tradingName}</p>
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Business Type:</span>
            <p className="text-foreground font-medium">
              {businessTypeLabels[formData.businessType]}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Years in Operation:</span>
            <p className="text-foreground font-medium">{formData.yearsInOperation}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Contact:</span>
            <p className="text-foreground font-medium">
              {formData.primaryContactPerson} ({formData.contactTitle})
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>
            <p className="text-foreground font-medium">{formData.email}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Phone:</span>
            <p className="text-foreground font-medium">{formData.directPhone}</p>
          </div>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="p-5 rounded-xl border border-border bg-secondary/30">
        <div className="flex items-center gap-2 mb-4">
          <FileCheck className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Compliance & Licensing</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">CIPC Number:</span>
            <p className="text-foreground font-medium">{formData.cipcNumber}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Tax/VAT Number:</span>
            <p className="text-foreground font-medium">{formData.taxVatNumber}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Transport License:</span>
            <p className="text-foreground font-medium">{formData.transportLicenseNumber}</p>
          </div>
          <div>
            <span className="text-muted-foreground">PDP Holders:</span>
            <p className="text-foreground font-medium">{formData.pdpHolders}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Cross-Border:</span>
            <p className="text-foreground font-medium">
              {formData.crossBorderOperations === "yes" ? "Yes" : "No"}
            </p>
          </div>
          {formData.insuranceCertificate && (
            <div>
              <span className="text-muted-foreground">Insurance Certificate:</span>
              <p className="text-foreground font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-primary" />
                Uploaded
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Fleet Summary */}
      <div className="p-5 rounded-xl border border-border bg-secondary/30">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Fleet Details</h3>
        </div>
        <div className="space-y-3">
          {formData.vehicles.map((vehicle, index) => (
            <div key={vehicle.id} className="text-sm p-3 rounded-lg bg-background/50">
              <p className="font-medium text-foreground">
                {vehicle.quantity}x {vehicle.vehicleType || "Not specified"}
              </p>
              <p className="text-muted-foreground">
                Capacity: {vehicle.payloadCapacity} | Dimensions: {vehicle.dimensions}
              </p>
              {vehicle.features && vehicle.features.length > 0 && (
                <p className="text-muted-foreground">
                  Features: {vehicle.features.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Operations Summary */}
      <div className="p-5 rounded-xl border border-border bg-secondary/30">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Operations</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Service Regions:</span>
            <p className="text-foreground font-medium">
              {formData.serviceRegions?.map((r) => regionLabels[r]).join(", ") || "Not specified"}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Cargo Types:</span>
            <p className="text-foreground font-medium">
              {formData.cargoTypes?.map((c) => cargoLabels[c]).join(", ") || "Not specified"}
            </p>
          </div>
          {formData.preferredRoutes && (
            <div>
              <span className="text-muted-foreground">Preferred Routes:</span>
              <p className="text-foreground font-medium">{formData.preferredRoutes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Referral Source */}
      <div className="pt-4 border-t border-border">
        <Label htmlFor="referralSource">How did you hear about Dyno Dash? *</Label>
        <Select
          value={formData.referralSource}
          onValueChange={(value) => updateFormData({ referralSource: value })}
        >
          <SelectTrigger className={errors.referralSource ? "border-destructive" : ""}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {referralSources.map((source) => (
              <SelectItem key={source} value={source}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.referralSource && (
          <p className="text-sm text-destructive mt-1">{errors.referralSource}</p>
        )}
      </div>

      <p className="text-sm text-muted-foreground p-4 rounded-lg bg-secondary/50 border border-border">
        By submitting, you agree to Dyno Dash's terms for carriers. Our team will verify your 
        documents and contact you within 2-3 business days. All information is kept confidential.
      </p>
    </div>
  );
};

export default Step5Review;
