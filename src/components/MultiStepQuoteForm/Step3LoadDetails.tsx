import { motion } from "framer-motion";
import { Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Step3Data } from "./types";

interface Step3Props {
  data: Step3Data;
  onChange: (data: Partial<Step3Data>) => void;
  errors: Record<string, string>;
}

const commodityClasses = [
  { value: "50", label: "Class 50 (Lowest)" },
  { value: "55", label: "Class 55" },
  { value: "60", label: "Class 60" },
  { value: "65", label: "Class 65" },
  { value: "70", label: "Class 70" },
  { value: "77.5", label: "Class 77.5" },
  { value: "85", label: "Class 85" },
  { value: "92.5", label: "Class 92.5" },
  { value: "100", label: "Class 100" },
  { value: "110", label: "Class 110" },
  { value: "125", label: "Class 125" },
  { value: "150", label: "Class 150" },
  { value: "175", label: "Class 175" },
  { value: "200", label: "Class 200" },
  { value: "250", label: "Class 250" },
  { value: "300", label: "Class 300" },
  { value: "400", label: "Class 400" },
  { value: "500", label: "Class 500 (Highest)" },
  { value: "unknown", label: "I don't know" },
];

const Step3LoadDetails = ({ data, onChange, errors }: Step3Props) => {
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
          Load Details
        </h2>
        <p className="text-muted-foreground">
          Specify the characteristics of your freight
        </p>
      </div>

      <div className="p-6 rounded-xl bg-secondary/30 border border-border space-y-6">
        <div className="flex items-center gap-2 text-primary mb-2">
          <Package className="w-5 h-5" />
          <span className="font-display font-semibold">Freight Specifications</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (lbs) *</Label>
            <Input
              id="weight"
              type="text"
              value={data.weight}
              onChange={(e) => onChange({ weight: e.target.value })}
              placeholder="e.g., 5000"
              className={errors.weight ? "border-destructive" : ""}
            />
            {errors.weight && (
              <p className="text-sm text-destructive">{errors.weight}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="palletCount">Pallet Count</Label>
            <Input
              id="palletCount"
              type="text"
              value={data.palletCount || ""}
              onChange={(e) => onChange({ palletCount: e.target.value })}
              placeholder="e.g., 10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dimensions">Dimensions (L x W x H)</Label>
          <Input
            id="dimensions"
            value={data.dimensions || ""}
            onChange={(e) => onChange({ dimensions: e.target.value })}
            placeholder="e.g., 48 x 40 x 48 inches"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="commodityClass">Commodity Class</Label>
          <Select
            value={data.commodityClass || ""}
            onValueChange={(value) => onChange({ commodityClass: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select freight class" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border max-h-60">
              {commodityClasses.map((cls) => (
                <SelectItem key={cls.value} value={cls.value}>
                  {cls.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label>Stackable?</Label>
            <RadioGroup
              value={data.stackable || ""}
              onValueChange={(value) => onChange({ stackable: value as "yes" | "no" | "" })}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="stackable-yes" />
                <Label htmlFor="stackable-yes" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="stackable-no" />
                <Label htmlFor="stackable-no" className="font-normal cursor-pointer">No</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Liftgate Required?</Label>
            <RadioGroup
              value={data.liftgateRequired || ""}
              onValueChange={(value) => onChange({ liftgateRequired: value as "yes" | "no" | "both" | "" })}
              className="flex gap-4 flex-wrap"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="liftgate-yes" />
                <Label htmlFor="liftgate-yes" className="font-normal cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="liftgate-no" />
                <Label htmlFor="liftgate-no" className="font-normal cursor-pointer">No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="liftgate-both" />
                <Label htmlFor="liftgate-both" className="font-normal cursor-pointer">Both Ends</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Step3LoadDetails;
