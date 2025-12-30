import { motion } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Step2Data } from "./types";

interface Step2Props {
  data: Step2Data;
  onChange: (data: Partial<Step2Data>) => void;
  errors: Record<string, string>;
}

const locationTypes = [
  { value: "business", label: "Business" },
  { value: "warehouse", label: "Warehouse" },
  { value: "residential", label: "Residential" },
  { value: "construction", label: "Construction Site" },
];

const Step2Locations = ({ data, onChange, errors }: Step2Props) => {
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
          Where & When
        </h2>
        <p className="text-muted-foreground">
          Specify pickup and delivery locations
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Pickup Column */}
        <div className="p-6 rounded-xl bg-secondary/30 border border-border space-y-5">
          <div className="flex items-center gap-2 text-primary mb-4">
            <MapPin className="w-5 h-5" />
            <span className="font-display font-semibold">Pickup</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupAddress">Address *</Label>
            <Input
              id="pickupAddress"
              value={data.pickupAddress}
              onChange={(e) => onChange({ pickupAddress: e.target.value })}
              placeholder="123 Main St, City, State"
              className={errors.pickupAddress ? "border-destructive" : ""}
            />
            {errors.pickupAddress && (
              <p className="text-sm text-destructive">{errors.pickupAddress}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupDate">Date</Label>
            <div className="relative">
              <Input
                id="pickupDate"
                type="date"
                value={data.pickupDate || ""}
                onChange={(e) => onChange({ pickupDate: e.target.value })}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupLocationType">Location Type *</Label>
            <Select
              value={data.pickupLocationType}
              onValueChange={(value) => onChange({ pickupLocationType: value })}
            >
              <SelectTrigger className={errors.pickupLocationType ? "border-destructive" : ""}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {locationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.pickupLocationType && (
              <p className="text-sm text-destructive">{errors.pickupLocationType}</p>
            )}
          </div>
        </div>

        {/* Delivery Column */}
        <div className="p-6 rounded-xl bg-secondary/30 border border-border space-y-5">
          <div className="flex items-center gap-2 text-primary mb-4">
            <MapPin className="w-5 h-5" />
            <span className="font-display font-semibold">Delivery</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">Address *</Label>
            <Input
              id="deliveryAddress"
              value={data.deliveryAddress}
              onChange={(e) => onChange({ deliveryAddress: e.target.value })}
              placeholder="456 Oak Ave, City, State"
              className={errors.deliveryAddress ? "border-destructive" : ""}
            />
            {errors.deliveryAddress && (
              <p className="text-sm text-destructive">{errors.deliveryAddress}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryDate">Required Date</Label>
            <div className="relative">
              <Input
                id="deliveryDate"
                type="date"
                value={data.deliveryDate || ""}
                onChange={(e) => onChange({ deliveryDate: e.target.value })}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryLocationType">Location Type *</Label>
            <Select
              value={data.deliveryLocationType}
              onValueChange={(value) => onChange({ deliveryLocationType: value })}
            >
              <SelectTrigger className={errors.deliveryLocationType ? "border-destructive" : ""}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {locationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.deliveryLocationType && (
              <p className="text-sm text-destructive">{errors.deliveryLocationType}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Step2Locations;
