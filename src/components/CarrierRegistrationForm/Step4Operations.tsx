import { CarrierFormData } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

interface Step4Props {
  formData: CarrierFormData;
  updateFormData: (data: Partial<CarrierFormData>) => void;
  errors: Record<string, string>;
}

const serviceRegions = [
  { id: "gauteng", label: "Gauteng" },
  { id: "western-cape", label: "Western Cape" },
  { id: "kwazulu-natal", label: "KwaZulu-Natal" },
  { id: "eastern-cape", label: "Eastern Cape" },
  { id: "free-state", label: "Free State" },
  { id: "cross-border", label: "Cross-Border (SADC)" },
  { id: "national", label: "National Coverage" },
];

const cargoTypes = [
  { id: "general-freight", label: "General Freight" },
  { id: "hazardous", label: "Hazardous Materials" },
  { id: "perishables", label: "Perishables (Cold Chain)" },
  { id: "high-value", label: "High-Value Goods" },
  { id: "automotive", label: "Automotive Parts" },
  { id: "bulk", label: "Bulk Materials" },
  { id: "livestock", label: "Live Animals" },
  { id: "other", label: "Other" },
];

const rateBasisOptions = [
  { id: "per-km", label: "Per Kilometer" },
  { id: "per-ton", label: "Per Ton" },
  { id: "per-trip", label: "Per Trip" },
  { id: "per-pallet", label: "Per Pallet Space" },
];

const Step4Operations = ({ formData, updateFormData, errors }: Step4Props) => {
  const toggleRegion = (regionId: string) => {
    const regions = formData.serviceRegions || [];
    const updatedRegions = regions.includes(regionId)
      ? regions.filter((r) => r !== regionId)
      : [...regions, regionId];
    updateFormData({ serviceRegions: updatedRegions });
  };

  const toggleCargoType = (cargoId: string) => {
    const types = formData.cargoTypes || [];
    const updatedTypes = types.includes(cargoId)
      ? types.filter((t) => t !== cargoId)
      : [...types, cargoId];
    updateFormData({ cargoTypes: updatedTypes });
  };

  const toggleRateBasis = (rateId: string) => {
    const rates = formData.rateBasis || [];
    const updatedRates = rates.includes(rateId)
      ? rates.filter((r) => r !== rateId)
      : [...rates, rateId];
    updateFormData({ rateBasis: updatedRates });
  };

  const hasHazmat = formData.cargoTypes?.includes("hazardous");

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">
          How You Operate
        </h2>
        <p className="text-muted-foreground">
          Tell us about your service areas and operational preferences.
        </p>
      </div>

      <div>
        <Label className="mb-3 block">Primary Service Regions *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {serviceRegions.map((region) => (
            <div
              key={region.id}
              className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                formData.serviceRegions?.includes(region.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => toggleRegion(region.id)}
            >
              <Checkbox
                id={region.id}
                checked={formData.serviceRegions?.includes(region.id) || false}
                onCheckedChange={() => toggleRegion(region.id)}
              />
              <Label htmlFor={region.id} className="text-sm font-normal cursor-pointer">
                {region.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.serviceRegions && (
          <p className="text-sm text-destructive mt-1">{errors.serviceRegions}</p>
        )}
      </div>

      <div>
        <Label htmlFor="preferredRoutes">Preferred Routes/Corridors</Label>
        <Textarea
          id="preferredRoutes"
          value={formData.preferredRoutes}
          onChange={(e) => updateFormData({ preferredRoutes: e.target.value })}
          placeholder="e.g., N3 Durban-JHB, N1 Cape Town-JHB, Maputo Corridor"
          rows={3}
        />
      </div>

      <div>
        <Label className="mb-3 block">Types of Cargo Willing to Transport *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cargoTypes.map((cargo) => (
            <div
              key={cargo.id}
              className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                formData.cargoTypes?.includes(cargo.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => toggleCargoType(cargo.id)}
            >
              <Checkbox
                id={cargo.id}
                checked={formData.cargoTypes?.includes(cargo.id) || false}
                onCheckedChange={() => toggleCargoType(cargo.id)}
              />
              <Label htmlFor={cargo.id} className="text-sm font-normal cursor-pointer">
                {cargo.label}
              </Label>
            </div>
          ))}
        </div>
        {errors.cargoTypes && (
          <p className="text-sm text-destructive mt-1">{errors.cargoTypes}</p>
        )}
      </div>

      <AnimatePresence>
        {hasHazmat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Label htmlFor="hazmatCertNumber">Hazmat Certificate Number</Label>
            <Input
              id="hazmatCertNumber"
              value={formData.hazmatCertNumber}
              onChange={(e) => updateFormData({ hazmatCertNumber: e.target.value })}
              placeholder="Your hazardous materials certification number"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <Label htmlFor="loadPreference">Minimum/Maximum Load Preference</Label>
        <Input
          id="loadPreference"
          value={formData.loadPreference}
          onChange={(e) => updateFormData({ loadPreference: e.target.value })}
          placeholder="e.g., Min 2-ton loads, Max 500km trips"
        />
      </div>

      <div>
        <Label className="mb-3 block">Typical Rate Basis</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {rateBasisOptions.map((rate) => (
            <div
              key={rate.id}
              className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                formData.rateBasis?.includes(rate.id)
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => toggleRateBasis(rate.id)}
            >
              <Checkbox
                id={rate.id}
                checked={formData.rateBasis?.includes(rate.id) || false}
                onCheckedChange={() => toggleRateBasis(rate.id)}
              />
              <Label htmlFor={rate.id} className="text-sm font-normal cursor-pointer">
                {rate.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step4Operations;
