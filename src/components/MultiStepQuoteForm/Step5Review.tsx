import { motion } from "framer-motion";
import { Check, MapPin, Package, AlertTriangle, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { QuoteFormData, Step5Data } from "./types";

interface Step5Props {
  formData: QuoteFormData;
  step5Data: Step5Data;
  onChange: (data: Partial<Step5Data>) => void;
}

const shipmentTypeLabels: Record<string, string> = {
  ftl: "Full Truckload",
  ltl: "Less Than Truckload",
  expedited: "Expedited",
  specialized: "Specialized",
};

const locationTypeLabels: Record<string, string> = {
  business: "Business",
  warehouse: "Warehouse",
  residential: "Residential",
  construction: "Construction Site",
};

const SummarySection = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="p-4 rounded-lg bg-secondary/30 border border-border">
    <div className="flex items-center gap-2 text-primary mb-3">
      <Icon className="w-4 h-4" />
      <span className="font-display font-semibold text-sm">{title}</span>
    </div>
    <div className="space-y-1 text-sm">{children}</div>
  </div>
);

const SummaryRow = ({ label, value }: { label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
};

const Step5Review = ({ formData, step5Data, onChange }: Step5Props) => {
  const hasSpecialRequirements =
    formData.hazmat || formData.tempControlled || formData.international || formData.additionalInsurance;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">
          Review Your Request
        </h2>
        <p className="text-muted-foreground">
          Verify your information before submitting
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <SummarySection icon={Check} title="Contact Info">
          <SummaryRow label="Name" value={formData.contactName} />
          <SummaryRow label="Company" value={formData.companyName} />
          <SummaryRow label="Email" value={formData.email} />
          <SummaryRow label="Phone" value={formData.phone} />
          <SummaryRow label="Type" value={shipmentTypeLabels[formData.shipmentType]} />
        </SummarySection>

        <SummarySection icon={MapPin} title="Locations">
          <SummaryRow label="Pickup" value={formData.pickupAddress} />
          <SummaryRow label="Pickup Date" value={formData.pickupDate} />
          <SummaryRow label="Pickup Type" value={locationTypeLabels[formData.pickupLocationType]} />
          <div className="border-t border-border my-2" />
          <SummaryRow label="Delivery" value={formData.deliveryAddress} />
          <SummaryRow label="Delivery Date" value={formData.deliveryDate} />
          <SummaryRow label="Delivery Type" value={locationTypeLabels[formData.deliveryLocationType]} />
        </SummarySection>

        <SummarySection icon={Package} title="Load Details">
          <SummaryRow label="Weight" value={formData.weight ? `${formData.weight} lbs` : undefined} />
          <SummaryRow label="Pallets" value={formData.palletCount} />
          <SummaryRow label="Dimensions" value={formData.dimensions} />
          <SummaryRow label="Class" value={formData.commodityClass ? `Class ${formData.commodityClass}` : undefined} />
          <SummaryRow label="Stackable" value={formData.stackable === "yes" ? "Yes" : formData.stackable === "no" ? "No" : undefined} />
          <SummaryRow label="Liftgate" value={formData.liftgateRequired === "both" ? "Both Ends" : formData.liftgateRequired === "yes" ? "Yes" : formData.liftgateRequired === "no" ? "No" : undefined} />
        </SummarySection>

        {hasSpecialRequirements && (
          <SummarySection icon={AlertTriangle} title="Special Requirements">
            {formData.hazmat && (
              <>
                <SummaryRow label="Hazmat" value="Yes" />
                <SummaryRow label="UN Number" value={formData.hazmatUN} />
                <SummaryRow label="Class" value={formData.hazmatClass} />
              </>
            )}
            {formData.tempControlled && (
              <>
                <SummaryRow label="Temp Controlled" value="Yes" />
                <SummaryRow label="Temp Range" value={formData.tempRange} />
                <SummaryRow label="Type" value={formData.tempType} />
              </>
            )}
            {formData.international && (
              <>
                <SummaryRow label="International" value="Yes" />
                <SummaryRow label="Countries" value={formData.countries} />
                <SummaryRow label="Customs Help" value={formData.customsClearance ? "Yes" : "No"} />
              </>
            )}
            {formData.additionalInsurance && (
              <>
                <SummaryRow label="Extra Insurance" value="Yes" />
                <SummaryRow label="Coverage" value={formData.insuranceCoverage} />
              </>
            )}
          </SummarySection>
        )}
      </div>

      {/* Load Description */}
      {formData.loadDescription && (
        <div className="p-4 rounded-lg bg-secondary/30 border border-border">
          <div className="flex items-center gap-2 text-primary mb-2">
            <FileText className="w-4 h-4" />
            <span className="font-display font-semibold text-sm">Load Description</span>
          </div>
          <p className="text-sm text-foreground">{formData.loadDescription}</p>
        </div>
      )}

      {/* Final Fields */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <Label htmlFor="specialInstructions">Special Instructions</Label>
          <Textarea
            id="specialInstructions"
            value={step5Data.specialInstructions || ""}
            onChange={(e) => onChange({ specialInstructions: e.target.value })}
            placeholder="Any additional notes or special requirements..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="referenceNumbers">Reference / PO Numbers</Label>
          <Input
            id="referenceNumbers"
            value={step5Data.referenceNumbers || ""}
            onChange={(e) => onChange({ referenceNumbers: e.target.value })}
            placeholder="Your internal reference numbers"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Step5Review;
