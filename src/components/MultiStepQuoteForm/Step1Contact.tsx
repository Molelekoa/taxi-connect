import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Step1Data } from "./types";

interface Step1Props {
  data: Step1Data;
  onChange: (data: Partial<Step1Data>) => void;
  errors: Record<string, string>;
}

const shipmentTypes = [
  { value: "ftl", label: "Full Truckload (FTL)" },
  { value: "ltl", label: "Less Than Truckload (LTL)" },
  { value: "expedited", label: "Expedited" },
  { value: "specialized", label: "Specialized" },
];

const Step1Contact = ({ data, onChange, errors }: Step1Props) => {
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
          Your Load & Contact Info
        </h2>
        <p className="text-muted-foreground">
          Tell us about yourself and your shipment
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name *</Label>
          <Input
            id="contactName"
            value={data.contactName}
            onChange={(e) => onChange({ contactName: e.target.value })}
            placeholder="John Smith"
            className={errors.contactName ? "border-destructive" : ""}
          />
          {errors.contactName && (
            <p className="text-sm text-destructive">{errors.contactName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={data.companyName || ""}
            onChange={(e) => onChange({ companyName: e.target.value })}
            placeholder="Acme Logistics"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="john@company.com"
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="(555) 123-4567"
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shipmentType">Shipment Type *</Label>
        <Select
          value={data.shipmentType}
          onValueChange={(value) => onChange({ shipmentType: value })}
        >
          <SelectTrigger className={errors.shipmentType ? "border-destructive" : ""}>
            <SelectValue placeholder="Select shipment type" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {shipmentTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.shipmentType && (
          <p className="text-sm text-destructive">{errors.shipmentType}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="loadDescription">Load Description *</Label>
        <Textarea
          id="loadDescription"
          value={data.loadDescription}
          onChange={(e) => onChange({ loadDescription: e.target.value })}
          placeholder="Briefly describe what you're shipping..."
          rows={3}
          className={errors.loadDescription ? "border-destructive" : ""}
        />
        {errors.loadDescription && (
          <p className="text-sm text-destructive">{errors.loadDescription}</p>
        )}
      </div>
    </motion.div>
  );
};

export default Step1Contact;
