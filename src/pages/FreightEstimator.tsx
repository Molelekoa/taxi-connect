import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
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

const cargoTypes = [
  { value: "general", label: "General Dry Goods", multiplier: 1.0 },
  { value: "perishables", label: "Perishables (Refrigerated)", multiplier: 1.4 },
  { value: "hazardous", label: "Hazardous Materials", multiplier: 1.6 },
  { value: "highvalue", label: "High-Value Goods", multiplier: 1.3 },
  { value: "fragile", label: "Fragile", multiplier: 1.25 },
  { value: "building", label: "Building Materials", multiplier: 1.1 },
  { value: "vehicles", label: "Vehicles", multiplier: 1.5 },
];

const sadcCountries = [
  "Botswana",
  "Lesotho",
  "Mozambique",
  "Namibia",
  "Eswatini",
  "Zimbabwe",
  "Other SADC",
];

const FreightEstimator = () => {
  const [formData, setFormData] = useState({
    pickupLocation: "",
    deliveryLocation: "",
    weight: "",
    cargoType: "",
    isFullTruckload: false,
    liftgate: false,
    crossBorder: false,
    express: false,
    tempControlled: false,
    securityEscort: false,
    extraInsurance: false,
    sadcCountry: "",
  });

  const [estimatedDistance, setEstimatedDistance] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Estimate distance when both locations are provided
    if (field === "pickupLocation" || field === "deliveryLocation") {
      const pickup = field === "pickupLocation" ? value : formData.pickupLocation;
      const delivery = field === "deliveryLocation" ? value : formData.deliveryLocation;
      
      if (pickup && delivery && typeof pickup === "string" && typeof delivery === "string") {
        // Simple distance estimation based on string length difference (mock)
        const mockDistance = Math.abs(pickup.length - delivery.length) * 50 + 150;
        setEstimatedDistance(Math.min(Math.max(mockDistance, 50), 2500));
      }
    }
  };

  const calculateEstimate = () => {
    const weight = parseFloat(formData.weight) || 0;
    if (weight <= 0 || !formData.cargoType) return;

    // Base rate calculation
    const baseRatePerKg = 12; // ZAR per kg
    const distanceRate = 0.85; // ZAR per km
    const distance = estimatedDistance || 500;

    // Get cargo multiplier
    const cargo = cargoTypes.find((c) => c.value === formData.cargoType);
    const cargoMultiplier = cargo?.multiplier || 1.0;

    // Calculate base cost
    let baseCost = weight * baseRatePerKg + distance * distanceRate;
    baseCost *= cargoMultiplier;

    // Apply full truckload discount
    if (formData.isFullTruckload) {
      baseCost *= 0.85;
    }

    // Add special requirements
    if (formData.liftgate) baseCost += 650;
    if (formData.crossBorder) baseCost += 2500;
    if (formData.express) baseCost *= 1.35;
    if (formData.tempControlled) baseCost *= 1.25;
    if (formData.securityEscort) baseCost += 4500;
    if (formData.extraInsurance) baseCost += weight * 2.5;

    // Calculate range
    const minPrice = Math.round(baseCost * 0.9);
    const maxPrice = Math.round(baseCost * 1.15);

    setPriceRange({ min: minPrice, max: maxPrice });
    setShowResult(true);
  };

  const isFormValid =
    formData.pickupLocation &&
    formData.deliveryLocation &&
    formData.weight &&
    parseFloat(formData.weight) > 0 &&
    formData.cargoType;

  const selectedCargo = cargoTypes.find((c) => c.value === formData.cargoType);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container-narrow max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
            <div className="bg-foreground text-background p-6 md:p-8">
              <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">
                Dyno Dash Quick Freight Estimator
              </h1>
              <p className="text-background/80">
                Get an instant estimate. We'll shop your load to our carrier network for the best final rate.
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              {/* Step 1: Basic Details */}
              <section className="space-y-6 pb-8 border-b border-border">
                <h2 className="font-display font-bold text-xl text-foreground">
                  Step 1: Basic Shipment Details
                </h2>

                <div className="grid gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="pickup">Pickup Location (City or Postal Code)*</Label>
                    <Input
                      id="pickup"
                      placeholder="e.g., Johannesburg or 2000"
                      value={formData.pickupLocation}
                      onChange={(e) => handleInputChange("pickupLocation", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delivery">Delivery Location (City or Postal Code)*</Label>
                    <Input
                      id="delivery"
                      placeholder="e.g., Cape Town or 8001"
                      value={formData.deliveryLocation}
                      onChange={(e) => handleInputChange("deliveryLocation", e.target.value)}
                    />
                  </div>

                  {estimatedDistance > 0 && (
                    <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                      Estimated distance: <span className="font-semibold text-foreground">{estimatedDistance} km</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="weight">Total Weight (kg)*</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="e.g., 500"
                      min="1"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cargo Type*</Label>
                    <Select
                      value={formData.cargoType}
                      onValueChange={(value) => handleInputChange("cargoType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cargo type" />
                      </SelectTrigger>
                      <SelectContent>
                        {cargoTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="fullTruck"
                      checked={formData.isFullTruckload}
                      onCheckedChange={(checked) =>
                        handleInputChange("isFullTruckload", checked === true)
                      }
                    />
                    <Label htmlFor="fullTruck" className="cursor-pointer font-normal">
                      Is this a Full Truckload (approx. 24+ pallets)?
                    </Label>
                  </div>
                </div>
              </section>

              {/* Step 2: Special Requirements */}
              <section className="space-y-6">
                <h2 className="font-display font-bold text-xl text-foreground">
                  Step 2: Special Requirements
                </h2>
                <p className="text-sm text-muted-foreground">Select all that apply:</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: "liftgate", label: "Liftgate required" },
                    { id: "crossBorder", label: "Cross-border to SADC" },
                    { id: "express", label: "Express delivery (within 48hrs)" },
                    { id: "tempControlled", label: "Temperature controlled" },
                    { id: "securityEscort", label: "Security escort requested" },
                    { id: "extraInsurance", label: "Extra cargo insurance" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={item.id}
                        checked={formData[item.id as keyof typeof formData] as boolean}
                        onCheckedChange={(checked) =>
                          handleInputChange(item.id, checked === true)
                        }
                      />
                      <Label htmlFor={item.id} className="cursor-pointer font-normal">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>

                {formData.crossBorder && (
                  <div className="space-y-2">
                    <Label>Select SADC Country</Label>
                    <Select
                      value={formData.sadcCountry}
                      onValueChange={(value) => handleInputChange("sadcCountry", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {sadcCountries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </section>

              {/* Calculate Button */}
              <div className="text-center pt-4">
                <Button
                  variant="hero"
                  size="lg"
                  onClick={calculateEstimate}
                  disabled={!isFormValid}
                  className="px-10"
                >
                  Calculate My Estimate
                </Button>
              </div>

              {/* Results */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 md:p-8 bg-gradient-to-br from-muted/50 to-muted rounded-xl border-l-4 border-primary"
                >
                  <h3 className="font-display font-bold text-2xl text-foreground mb-2">
                    Your Instant Estimate
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Based on {formData.weight} kg of {selectedCargo?.label || "goods"}.
                  </p>

                  <div className="text-4xl md:text-5xl font-display font-black text-primary my-4">
                    R {priceRange.min.toLocaleString()} — R {priceRange.max.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    (Final quote subject to carrier confirmation)
                  </p>

                  <div className="bg-card p-5 rounded-lg mt-6 space-y-2 text-sm">
                    <p className="font-semibold text-foreground">This estimate includes:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Standard road freight</li>
                      <li>• Fuel levy (current surcharge)</li>
                      <li>• Basic cargo liability</li>
                    </ul>
                    <p className="font-semibold text-foreground mt-4">Key factors affecting your quote:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Distance: ~{estimatedDistance} km</li>
                      <li>• Load size: {formData.weight} kg</li>
                      {formData.isFullTruckload && <li>• Full truckload discount applied</li>}
                      {formData.express && <li>• Express delivery surcharge</li>}
                      {formData.crossBorder && <li>• Cross-border fees</li>}
                    </ul>
                  </div>

                  <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
                    <strong>Disclaimer:</strong> This is an automated estimate only. Actual pricing will be confirmed by our team after reviewing your full shipment details. Additional fees may apply for access restrictions, waiting time, or special handling.
                  </p>

                  <div className="text-center mt-6">
                    <Link to="/get-quote">
                      <Button variant="default" size="lg" className="bg-foreground hover:bg-foreground/90 text-background">
                        Get Your Official Quote →
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreightEstimator;
