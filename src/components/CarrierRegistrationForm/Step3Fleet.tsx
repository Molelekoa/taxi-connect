import { CarrierFormData, VehicleEntry, VehiclePhotos } from "./types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Truck, Upload, X, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const photoViews: { key: keyof VehiclePhotos; label: string }[] = [
  { key: "front", label: "Front View" },
  { key: "side", label: "Side View" },
  { key: "back", label: "Back View" },
];

interface Step3Props {
  formData: CarrierFormData;
  updateFormData: (data: Partial<CarrierFormData>) => void;
  errors: Record<string, string>;
}

const vehicleTypes = [
  "Bakkie",
  "Panel Van",
  "Minibus",
  "Rigid Truck (5-ton)",
  "Rigid Truck (8-ton)",
  "Freight Truck (10-ton+)",
  "Semi-Truck (Tractor Unit)",
  "Super-Link",
  "Interlink",
  "Flatbed",
  "Side Curtain",
  "Refrigerated (Reefer)",
  "Tipper",
  "Tanker",
  "Other",
];

const vehicleFeatures = [
  { id: "tail-lift", label: "Tail-Lift" },
  { id: "liftgate", label: "Liftgate" },
  { id: "side-loader", label: "Side Loader" },
  { id: "satellite-tracking", label: "Satellite Tracking" },
  { id: "euro-spec", label: "Euro Spec (for cross-border)" },
  { id: "other", label: "Other" },
];

const Step3Fleet = ({ formData, updateFormData, errors }: Step3Props) => {
  const addVehicle = () => {
    const newVehicle: VehicleEntry = {
      id: crypto.randomUUID(),
      vehicleType: "",
      quantity: 1,
      minPayloadCapacity: "",
      maxPayloadCapacity: "",
      dimensionLength: "",
      dimensionWidth: "",
      dimensionHeight: "",
      features: [],
      photos: { front: "", side: "", back: "" },
    };
    updateFormData({ vehicles: [...formData.vehicles, newVehicle] });
  };

  const handlePhotoUpload = (vehicleId: string, viewKey: keyof VehiclePhotos, file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const vehicle = formData.vehicles.find((v) => v.id === vehicleId);
        if (vehicle) {
          const updatedPhotos = { ...vehicle.photos, [viewKey]: base64 };
          updateVehicle(vehicleId, { photos: updatedPhotos });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (vehicleId: string, viewKey: keyof VehiclePhotos) => {
    const vehicle = formData.vehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      const updatedPhotos = { ...vehicle.photos, [viewKey]: "" };
      updateVehicle(vehicleId, { photos: updatedPhotos });
    }
  };

  const removeVehicle = (id: string) => {
    if (formData.vehicles.length > 1) {
      updateFormData({ vehicles: formData.vehicles.filter((v) => v.id !== id) });
    }
  };

  const updateVehicle = (id: string, updates: Partial<VehicleEntry>) => {
    updateFormData({
      vehicles: formData.vehicles.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    });
  };

  const toggleFeature = (vehicleId: string, feature: string) => {
    const vehicle = formData.vehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      const features = vehicle.features || [];
      const updatedFeatures = features.includes(feature)
        ? features.filter((f) => f !== feature)
        : [...features, feature];
      updateVehicle(vehicleId, { features: updatedFeatures });
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">
          Your Fleet & Equipment
        </h2>
        <p className="text-muted-foreground">
          Add details about each type of vehicle in your fleet.
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {formData.vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="p-6 rounded-xl border border-border bg-secondary/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Vehicle {index + 1}</h3>
              </div>
              {formData.vehicles.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeVehicle(vehicle.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Vehicle Type *</Label>
                <Select
                  value={vehicle.vehicleType}
                  onValueChange={(value) => updateVehicle(vehicle.id, { vehicleType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  min={1}
                  value={vehicle.quantity}
                  onChange={(e) =>
                    updateVehicle(vehicle.id, { quantity: parseInt(e.target.value) || 1 })
                  }
                  placeholder="Number of this type"
                />
              </div>

              <div>
                <Label>Minimum Load (kg) *</Label>
                <Input
                  type="number"
                  value={vehicle.minPayloadCapacity}
                  onChange={(e) =>
                    updateVehicle(vehicle.id, { minPayloadCapacity: e.target.value })
                  }
                  placeholder="e.g., 500"
                />
              </div>

              <div>
                <Label>Maximum Load (kg) *</Label>
                <Input
                  type="number"
                  value={vehicle.maxPayloadCapacity}
                  onChange={(e) =>
                    updateVehicle(vehicle.id, { maxPayloadCapacity: e.target.value })
                  }
                  placeholder="e.g., 5000"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <Label>Length (m) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={vehicle.dimensionLength}
                  onChange={(e) =>
                    updateVehicle(vehicle.id, { dimensionLength: e.target.value })
                  }
                  placeholder="e.g., 6"
                />
              </div>

              <div>
                <Label>Width (m) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={vehicle.dimensionWidth}
                  onChange={(e) =>
                    updateVehicle(vehicle.id, { dimensionWidth: e.target.value })
                  }
                  placeholder="e.g., 2.4"
                />
              </div>

              <div>
                <Label>Height (m) *</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={vehicle.dimensionHeight}
                  onChange={(e) =>
                    updateVehicle(vehicle.id, { dimensionHeight: e.target.value })
                  }
                  placeholder="e.g., 2.6"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label className="mb-3 block">Vehicle Photos</Label>
              <div className="grid grid-cols-3 gap-3">
                {photoViews.map(({ key, label }) => {
                  const photoUrl = vehicle.photos?.[key];
                  return (
                    <div key={key} className="flex flex-col items-center">
                      {photoUrl ? (
                        <div className="relative">
                          <img
                            src={photoUrl}
                            alt={label}
                            className="w-full h-20 object-cover rounded-lg border border-border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-5 w-5"
                            onClick={() => removePhoto(vehicle.id, key)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                          <Camera className="w-5 h-5 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePhotoUpload(vehicle.id, key, file);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4">
              <Label className="mb-3 block">Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vehicleFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`${vehicle.id}-${feature.id}`}
                      checked={(vehicle.features || []).includes(feature.id)}
                      onCheckedChange={() => toggleFeature(vehicle.id, feature.id)}
                    />
                    <Label
                      htmlFor={`${vehicle.id}-${feature.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {feature.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {errors.vehicles && (
        <p className="text-sm text-destructive">{errors.vehicles}</p>
      )}

      <Button
        type="button"
        variant="outline"
        onClick={addVehicle}
        className="w-full border-dashed"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Another Vehicle
      </Button>

      <div className="pt-4 border-t border-border">
        <Label className="mb-3 block">
          Do you have access to or prefer using trailer/dolly combinations? *
        </Label>
        <RadioGroup
          value={formData.trailerPreference}
          onValueChange={(value) => updateFormData({ trailerPreference: value as any })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="frequently" id="trailer-freq" />
            <Label htmlFor="trailer-freq" className="cursor-pointer font-normal">
              Yes, frequently
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="if-needed" id="trailer-needed" />
            <Label htmlFor="trailer-needed" className="cursor-pointer font-normal">
              Yes, if needed
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="trailer-no" />
            <Label htmlFor="trailer-no" className="cursor-pointer font-normal">
              No
            </Label>
          </div>
        </RadioGroup>
        {errors.trailerPreference && (
          <p className="text-sm text-destructive mt-1">{errors.trailerPreference}</p>
        )}
      </div>
    </div>
  );
};

export default Step3Fleet;
