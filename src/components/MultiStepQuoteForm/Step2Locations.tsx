import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { AddressInput } from "@/components/ui/address-input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
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
  const [pickupCalendarOpen, setPickupCalendarOpen] = useState(false);
  const [deliveryCalendarOpen, setDeliveryCalendarOpen] = useState(false);

  const parseDate = (dateString: string | undefined): Date | undefined => {
    if (!dateString) return undefined;
    return new Date(dateString);
  };

  const handlePickupDateSelect = (date: Date | undefined) => {
    onChange({ pickupDate: date ? format(date, "yyyy-MM-dd") : "" });
    setPickupCalendarOpen(false);
  };

  const handleDeliveryDateSelect = (date: Date | undefined) => {
    onChange({ deliveryDate: date ? format(date, "yyyy-MM-dd") : "" });
    setDeliveryCalendarOpen(false);
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
            <AddressInput
              id="pickupAddress"
              value={data.pickupAddress}
              onChange={(value) => onChange({ pickupAddress: value })}
              placeholder="123 Main St, City, Province"
              className={errors.pickupAddress ? "border-destructive" : ""}
            />
            {errors.pickupAddress && (
              <p className="text-sm text-destructive">{errors.pickupAddress}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover open={pickupCalendarOpen} onOpenChange={setPickupCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data.pickupDate && "text-muted-foreground"
                  )}
                >
                  {data.pickupDate
                    ? format(parseDate(data.pickupDate)!, "PPP")
                    : "Select pickup date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                <Calendar
                  mode="single"
                  selected={parseDate(data.pickupDate)}
                  onSelect={handlePickupDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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
            <AddressInput
              id="deliveryAddress"
              value={data.deliveryAddress}
              onChange={(value) => onChange({ deliveryAddress: value })}
              placeholder="456 Oak Ave, City, Province"
              className={errors.deliveryAddress ? "border-destructive" : ""}
            />
            {errors.deliveryAddress && (
              <p className="text-sm text-destructive">{errors.deliveryAddress}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Required Date</Label>
            <Popover open={deliveryCalendarOpen} onOpenChange={setDeliveryCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !data.deliveryDate && "text-muted-foreground"
                  )}
                >
                  {data.deliveryDate
                    ? format(parseDate(data.deliveryDate)!, "PPP")
                    : "Select delivery date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                <Calendar
                  mode="single"
                  selected={parseDate(data.deliveryDate)}
                  onSelect={handleDeliveryDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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
