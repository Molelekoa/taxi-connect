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

const goodsCategories = [
  { value: "light-bulky", label: "Clothing, Footwear, Bedding, Pillows (Light & Bulky)" },
  { value: "average-boxed", label: "Paper Goods, Books, Boxed Cereal/Pasta (Average Boxed Goods)" },
  { value: "electronics", label: "Electronics, Toys, Plastic Household Items" },
  { value: "dense-heavy", label: "Auto Parts, Machinery, Metal Products (Dense & Heavy)" },
  { value: "furniture", label: "Furniture, Cabinets, Large Fixtures" },
  { value: "fragile", label: "Wine, Glass, Ceramics, Fragile Items" },
  { value: "bagged-goods", label: "Bagged/Boxed Grains, Powdered Goods" },
];

// Helper to parse dimension string into parts
const parseDimensions = (dimensions: string | undefined): { length: string; width: string; height: string } => {
  if (!dimensions) return { length: "", width: "", height: "" };
  const parts = dimensions.split("x").map(p => p.trim());
  return {
    length: parts[0] || "",
    width: parts[1] || "",
    height: parts[2] || "",
  };
};

const Step3LoadDetails = ({ data, onChange, errors }: Step3Props) => {
  const dims = parseDimensions(data.dimensions);

  const updateDimension = (field: "length" | "width" | "height", value: string) => {
    const newDims = { ...dims, [field]: value };
    const dimensionString = `${newDims.length} x ${newDims.width} x ${newDims.height}`;
    onChange({ dimensions: dimensionString });
  };

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
            <Label htmlFor="weight">Weight (kg) *</Label>
            <Input
              id="weight"
              type="text"
              value={data.weight}
              onChange={(e) => onChange({ weight: e.target.value })}
              placeholder="e.g., 2500"
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

        <div className="space-y-3">
          <Label>Dimensions (cm)</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="length" className="text-xs text-muted-foreground">Length</Label>
              <Input
                id="length"
                type="text"
                value={dims.length}
                onChange={(e) => updateDimension("length", e.target.value)}
                placeholder="L"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="width" className="text-xs text-muted-foreground">Width</Label>
              <Input
                id="width"
                type="text"
                value={dims.width}
                onChange={(e) => updateDimension("width", e.target.value)}
                placeholder="W"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="height" className="text-xs text-muted-foreground">Height</Label>
              <Input
                id="height"
                type="text"
                value={dims.height}
                onChange={(e) => updateDimension("height", e.target.value)}
                placeholder="H"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="commodityClass">What best describes your goods?</Label>
          <p className="text-xs text-muted-foreground mb-1">
            Select the closest match. This helps us calculate the safest and most accurate rate.
          </p>
          <Select
            value={data.commodityClass || ""}
            onValueChange={(value) => onChange({ commodityClass: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Please select a category --" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border max-h-60">
              {goodsCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
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
