import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Thermometer, Globe, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Step4Data } from "./types";

interface Step4Props {
  data: Step4Data;
  onChange: (data: Partial<Step4Data>) => void;
}

const africanCountries = [
  { value: "south-africa", label: "South Africa" },
  { value: "namibia", label: "Namibia" },
  { value: "botswana", label: "Botswana" },
  { value: "zimbabwe", label: "Zimbabwe" },
  { value: "mozambique", label: "Mozambique" },
  { value: "zambia", label: "Zambia" },
  { value: "malawi", label: "Malawi" },
  { value: "lesotho", label: "Lesotho" },
  { value: "eswatini", label: "Eswatini" },
  { value: "tanzania", label: "Tanzania" },
  { value: "kenya", label: "Kenya" },
  { value: "drc", label: "Democratic Republic of Congo" },
  { value: "angola", label: "Angola" },
];

const ToggleCard = ({
  icon: Icon,
  title,
  description,
  isOpen,
  onToggle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-5 flex items-center justify-between bg-card hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOpen ? "bg-primary" : "bg-secondary"}`}>
            <Icon className={`w-5 h-5 ${isOpen ? "text-primary-foreground" : "text-primary"}`} />
          </div>
          <div className="text-left">
            <h4 className="font-display font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <Switch checked={isOpen} onCheckedChange={onToggle} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-border bg-secondary/20">
              <div className="pt-5 space-y-4">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Step4Special = ({ data, onChange }: Step4Props) => {
  // Parse selected countries from comma-separated string
  const selectedCountries = data.countries ? data.countries.split(", ").filter(Boolean) : [];

  const toggleCountry = (countryLabel: string) => {
    const newSelection = selectedCountries.includes(countryLabel)
      ? selectedCountries.filter(c => c !== countryLabel)
      : [...selectedCountries, countryLabel];
    onChange({ countries: newSelection.join(", ") });
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
          Special Handling
        </h2>
        <p className="text-muted-foreground">
          Toggle any special requirements that apply
        </p>
      </div>

      <div className="space-y-4">
        {/* Hazmat */}
        <ToggleCard
          icon={AlertTriangle}
          title="Hazardous Materials"
          description="UN-classified dangerous goods"
          isOpen={data.hazmat || false}
          onToggle={() => onChange({ hazmat: !data.hazmat })}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hazmatUN">UN/NA Number</Label>
              <Input
                id="hazmatUN"
                value={data.hazmatUN || ""}
                onChange={(e) => onChange({ hazmatUN: e.target.value })}
                placeholder="e.g., UN1234"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hazmatClass">Hazard Class</Label>
              <Select
                value={data.hazmatClass || ""}
                onValueChange={(value) => onChange({ hazmatClass: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="1">Class 1 - Explosives</SelectItem>
                  <SelectItem value="2">Class 2 - Gases</SelectItem>
                  <SelectItem value="3">Class 3 - Flammable Liquids</SelectItem>
                  <SelectItem value="4">Class 4 - Flammable Solids</SelectItem>
                  <SelectItem value="5">Class 5 - Oxidizers</SelectItem>
                  <SelectItem value="6">Class 6 - Toxic/Infectious</SelectItem>
                  <SelectItem value="7">Class 7 - Radioactive</SelectItem>
                  <SelectItem value="8">Class 8 - Corrosives</SelectItem>
                  <SelectItem value="9">Class 9 - Misc. Dangerous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="hazmatSDS">SDS Reference</Label>
            <Input
              id="hazmatSDS"
              value={data.hazmatSDS || ""}
              onChange={(e) => onChange({ hazmatSDS: e.target.value })}
              placeholder="Safety Data Sheet reference number"
            />
          </div>
        </ToggleCard>

        {/* Temperature Controlled */}
        <ToggleCard
          icon={Thermometer}
          title="Temperature Controlled"
          description="Refrigerated or frozen transport"
          isOpen={data.tempControlled || false}
          onToggle={() => onChange({ tempControlled: !data.tempControlled })}
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tempRange">Temperature Range (°C)</Label>
              <Input
                id="tempRange"
                value={data.tempRange || ""}
                onChange={(e) => onChange({ tempRange: e.target.value })}
                placeholder="e.g., 2-8°C"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tempType">Type</Label>
              <Select
                value={data.tempType || ""}
                onValueChange={(value) => onChange({ tempType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="refrigerated">Refrigerated</SelectItem>
                  <SelectItem value="frozen">Frozen</SelectItem>
                  <SelectItem value="heated">Heated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </ToggleCard>

        {/* International */}
        <ToggleCard
          icon={Globe}
          title="Cross-Border / SADC"
          description="Shipments crossing African borders"
          isOpen={data.international || false}
          onToggle={() => onChange({ international: !data.international })}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Countries Involved (select up to 3)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {africanCountries.map((country) => (
                  <div
                    key={country.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={country.value}
                      checked={selectedCountries.includes(country.label)}
                      onCheckedChange={() => toggleCountry(country.label)}
                      disabled={
                        selectedCountries.length >= 3 &&
                        !selectedCountries.includes(country.label)
                      }
                    />
                    <Label
                      htmlFor={country.value}
                      className="font-normal cursor-pointer text-sm"
                    >
                      {country.label}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedCountries.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedCountries.join(", ")}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="customsClearance"
                checked={data.customsClearance || false}
                onCheckedChange={(checked) => onChange({ customsClearance: !!checked })}
              />
              <Label htmlFor="customsClearance" className="font-normal cursor-pointer">
                Need customs clearance assistance?
              </Label>
            </div>
          </div>
        </ToggleCard>

        {/* Additional Insurance */}
        <ToggleCard
          icon={Shield}
          title="Additional Insurance"
          description="Extra cargo coverage beyond standard"
          isOpen={data.additionalInsurance || false}
          onToggle={() => onChange({ additionalInsurance: !data.additionalInsurance })}
        >
          <div className="space-y-2">
            <Label htmlFor="insuranceCoverage">Desired Coverage Amount (ZAR)</Label>
            <Input
              id="insuranceCoverage"
              value={data.insuranceCoverage || ""}
              onChange={(e) => onChange({ insuranceCoverage: e.target.value })}
              placeholder="e.g., R 500,000"
            />
          </div>
        </ToggleCard>
      </div>
    </motion.div>
  );
};

export default Step4Special;
