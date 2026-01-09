import { CarrierFormData } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Package, Phone, Users } from "lucide-react";

interface Step4Props {
  formData: CarrierFormData;
  updateFormData: (data: Partial<CarrierFormData>) => void;
  errors: Record<string, string>;
}

const Step4Operations = ({ formData, updateFormData, errors }: Step4Props) => {
  const serviceRegions = [
    { value: "gauteng", label: "Gauteng" },
    { value: "western-cape", label: "Western Cape" },
    { value: "kwazulu-natal", label: "KwaZulu-Natal" },
    { value: "eastern-cape", label: "Eastern Cape" },
    { value: "free-state", label: "Free State" },
    { value: "limpopo", label: "Limpopo" },
    { value: "mpumalanga", label: "Mpumalanga" },
    { value: "north-west", label: "North West" },
    { value: "northern-cape", label: "Northern Cape" },
    { value: "lesotho", label: "Lesotho" },
    { value: "zimbabwe", label: "Zimbabwe" },
  ];

  const cargoTypes = [
    { id: "documents", label: "Documents & Paperwork" },
    { id: "electronics", label: "Electronic Devices" },
    { id: "medication", label: "Medication & Pharmacy" },
    { id: "automotive", label: "Automotive Parts" },
    { id: "clothing", label: "Clothing & Apparel" },
    { id: "food-ambient", label: "Food (Non-perishable)" },
    { id: "gifts", label: "Gifts & Personal Items" },
    { id: "books", label: "Books & Printed Materials" },
  ];

  const relationshipOptions = [
    "Spouse/Partner",
    "Parent",
    "Sibling",
    "Child",
    "Friend",
    "Other",
  ];

  const toggleCargoType = (cargoId: string) => {
    const current = formData.cargoTypes || [];
    if (current.includes(cargoId)) {
      updateFormData({ cargoTypes: current.filter((id) => id !== cargoId) });
    } else {
      updateFormData({ cargoTypes: [...current, cargoId] });
    }
  };

  const toggleRegion = (regionValue: string) => {
    const current = formData.additionalRegions || [];
    if (current.includes(regionValue)) {
      updateFormData({ additionalRegions: current.filter((r) => r !== regionValue) });
    } else {
      updateFormData({ additionalRegions: [...current, regionValue] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          Operations & Preferences
        </h2>
        <p className="text-muted-foreground">
          Tell us where you'd like to operate and what types of parcels you can carry.
        </p>
      </div>

      {/* Primary Service Region */}
      <div>
        <Label htmlFor="primaryServiceRegion" className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          Primary Service Region *
        </Label>
        <Select
          value={formData.primaryServiceRegion}
          onValueChange={(value) => updateFormData({ primaryServiceRegion: value })}
        >
          <SelectTrigger className={errors.primaryServiceRegion ? "border-destructive" : ""}>
            <SelectValue placeholder="Select your main operating area" />
          </SelectTrigger>
          <SelectContent>
            {serviceRegions.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.primaryServiceRegion && (
          <p className="text-sm text-destructive mt-1">{errors.primaryServiceRegion}</p>
        )}
      </div>

      {/* Additional Regions */}
      <div>
        <Label className="mb-3 block">Additional Regions (Optional)</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Select any other regions you're willing to service
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {serviceRegions
            .filter((r) => r.value !== formData.primaryServiceRegion)
            .map((region) => (
              <div
                key={region.value}
                className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  formData.additionalRegions?.includes(region.value)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => toggleRegion(region.value)}
              >
                <Checkbox
                  checked={formData.additionalRegions?.includes(region.value)}
                  onCheckedChange={() => toggleRegion(region.value)}
                />
                <Label className="cursor-pointer font-normal text-sm">{region.label}</Label>
              </div>
            ))}
        </div>
      </div>

      {/* Cargo Types */}
      <div>
        <Label className="mb-3 block flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          Parcel Types You Can Carry *
        </Label>
        <div className="grid grid-cols-2 gap-3">
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
                checked={formData.cargoTypes?.includes(cargo.id)}
                onCheckedChange={() => toggleCargoType(cargo.id)}
              />
              <Label className="cursor-pointer font-normal text-sm">{cargo.label}</Label>
            </div>
          ))}
        </div>
        {errors.cargoTypes && (
          <p className="text-sm text-destructive mt-1">{errors.cargoTypes}</p>
        )}
      </div>

      {/* Emergency Contact Section */}
      <div className="pt-4 border-t border-border">
        <Label className="mb-4 block text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Emergency Contact
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Please provide an emergency contact we can reach if needed.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="emergencyContactName">Contact Name *</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
              placeholder="Full name"
              className={errors.emergencyContactName ? "border-destructive" : ""}
            />
            {errors.emergencyContactName && (
              <p className="text-sm text-destructive mt-1">{errors.emergencyContactName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="emergencyContactRelation">Relationship *</Label>
            <Select
              value={formData.emergencyContactRelation}
              onValueChange={(value) => updateFormData({ emergencyContactRelation: value })}
            >
              <SelectTrigger className={errors.emergencyContactRelation ? "border-destructive" : ""}>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {relationshipOptions.map((option) => (
                  <SelectItem key={option} value={option.toLowerCase()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.emergencyContactRelation && (
              <p className="text-sm text-destructive mt-1">{errors.emergencyContactRelation}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="emergencyContactPhone" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Contact Phone Number *
          </Label>
          <Input
            id="emergencyContactPhone"
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
            placeholder="+27 XX XXX XXXX"
            className={errors.emergencyContactPhone ? "border-destructive" : ""}
          />
          {errors.emergencyContactPhone && (
            <p className="text-sm text-destructive mt-1">{errors.emergencyContactPhone}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step4Operations;
