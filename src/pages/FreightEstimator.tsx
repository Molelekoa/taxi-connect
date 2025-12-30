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
  { value: "botswana", label: "Botswana (Gaborone)" },
  { value: "lesotho", label: "Lesotho (Maseru)" },
  { value: "mozambique", label: "Mozambique (Maputo)" },
  { value: "namibia", label: "Namibia (Windhoek)" },
  { value: "eswatini", label: "Eswatini (Manzini)" },
  { value: "zambia", label: "Zambia (Lusaka)" },
  { value: "zimbabwe", label: "Zimbabwe (Harare)" },
];

// Predefined domestic distances (in km)
const PREDEFINED_DISTANCES: Record<string, number> = {
  'johannesburg-cape': 1400,
  'johannesburg-durban': 570,
  'johannesburg-pretoria': 60,
  'johannesburg-port': 580,
  'cape-durban': 1660,
  'cape-port': 770,
  'durban-port': 1050,
  'pretoria-durban': 630,
  'pretoria-cape': 1460,
};

// SADC country distances from Johannesburg (in km)
const SADC_DISTANCES: Record<string, number> = {
  'botswana': 356,
  'lesotho': 410.7,
  'mozambique': 545.1,
  'namibia': 1625.4,
  'eswatini': 398.2,
  'zambia': 1732.6,
  'zimbabwe': 1121.3
};

// Cross-border cost constants
const CROSS_BORDER_RATE_PER_KM = { min: 7, max: 18 }; // R7–R18 per km
const CROSS_BORDER_ADMIN_FEE = 1200; // R1,200 fixed fee

// Distance estimation function
function estimateDistance(pickup: string, delivery: string, sadcCountry?: string): number {
  const pickupLower = pickup.toLowerCase();
  const deliveryLower = delivery.toLowerCase();

  // 1. First, check for a direct match in the original domestic routes
  const route1 = `${pickupLower.split(' ')[0]}-${deliveryLower.split(' ')[0]}`;
  const route2 = `${deliveryLower.split(' ')[0]}-${pickupLower.split(' ')[0]}`;

  if (PREDEFINED_DISTANCES[route1]) return PREDEFINED_DISTANCES[route1];
  if (PREDEFINED_DISTANCES[route2]) return PREDEFINED_DISTANCES[route2];

  // 2. Check if the delivery location is a SADC country
  for (const [country, distance] of Object.entries(SADC_DISTANCES)) {
    if (deliveryLower.includes(country) || (sadcCountry && sadcCountry.toLowerCase().includes(country))) {
      return distance;
    }
  }

  // 3. Fallback: Assume a domestic route if no match is found
  return 500;
}

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
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      
      // Update distance when locations or SADC country changes
      if (field === "pickupLocation" || field === "deliveryLocation" || field === "sadcCountry") {
        const pickup = field === "pickupLocation" ? value : prev.pickupLocation;
        const delivery = field === "deliveryLocation" ? value : prev.deliveryLocation;
        const sadc = field === "sadcCountry" ? value : prev.sadcCountry;
        
        if (pickup && delivery && typeof pickup === "string" && typeof delivery === "string") {
          const distance = estimateDistance(pickup, delivery, typeof sadc === "string" ? sadc : undefined);
          setEstimatedDistance(distance);
        }
      }
      
      return newData;
    });
  };

  const calculateEstimate = () => {
    const weight = parseFloat(formData.weight) || 0;
    if (weight <= 0 || !formData.cargoType) return;

    // Get cargo multiplier
    const cargo = cargoTypes.find((c) => c.value === formData.cargoType);
    const cargoMultiplier = cargo?.multiplier || 1.0;

    // Check if this is a full truckload
    const isFTL = formData.isFullTruckload;

    // Base LTL rates (per kg)
    const BASE_RATES = { ltlPerKg: { min: 8, max: 15 } };

    // Calculate initial distance
    let distance = estimateDistance(formData.pickupLocation, formData.deliveryLocation);
    
    // Domestic base cost calculation
    const baseRatePerKm = { min: 4.5, max: 12 };
    let minCost = distance * baseRatePerKm.min * cargoMultiplier;
    let maxCost = distance * baseRatePerKm.max * cargoMultiplier;

    // APPLY CROSS-BORDER COSTS (if selected)
    if (formData.crossBorder) {
      const selectedCountry = formData.sadcCountry;
      if (selectedCountry && SADC_DISTANCES[selectedCountry]) {
        // Use cross-border per-km rate instead of domestic rate
        const crossBorderDistance = SADC_DISTANCES[selectedCountry];
        distance = crossBorderDistance;

        // Override the base cost calculation for cross-border
        if (isFTL) {
          minCost = crossBorderDistance * CROSS_BORDER_RATE_PER_KM.min * cargoMultiplier;
          maxCost = crossBorderDistance * CROSS_BORDER_RATE_PER_KM.max * cargoMultiplier;
        } else {
          // For LTL, still use per-kg but with a cross-border multiplier
          minCost = weight * BASE_RATES.ltlPerKg.min * 1.5 * cargoMultiplier;
          maxCost = weight * BASE_RATES.ltlPerKg.max * 1.5 * cargoMultiplier;
        }

        // Add the fixed admin fee
        minCost += CROSS_BORDER_ADMIN_FEE;
        maxCost += CROSS_BORDER_ADMIN_FEE;
      }
    }

    setEstimatedDistance(distance);

    // Weight factor (heavier loads cost more) - only for domestic
    if (!formData.crossBorder) {
      const weightFactor = 1 + (weight / 10000) * 0.3;
      minCost *= weightFactor;
      maxCost *= weightFactor;
    }

    // Apply full truckload discount
    if (isFTL) {
      minCost *= 0.85;
      maxCost *= 0.9;
    }

    // Add special requirements
    if (formData.liftgate) {
      minCost += 650;
      maxCost += 650;
    }
    if (formData.express) {
      minCost *= 1.25;
      maxCost *= 1.25;
    }
    if (formData.tempControlled) {
      minCost *= 1.3;
      maxCost *= 1.3;
    }
    if (formData.securityEscort) {
      minCost += 2500;
      maxCost += 2500;
    }
    if (formData.extraInsurance) {
      minCost *= 1.08;
      maxCost *= 1.08;
    }

    // Minimum charge
    minCost = Math.max(minCost, 1500);
    maxCost = Math.max(maxCost, 2500);

    setPriceRange({ min: Math.round(minCost), max: Math.round(maxCost) });
    setShowResult(true);
  };

  const isFormValid =
    formData.pickupLocation &&
    formData.deliveryLocation &&
    formData.weight &&
    parseFloat(formData.weight) > 0 &&
    formData.cargoType &&
    (!formData.crossBorder || formData.sadcCountry);

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
                  <div className="space-y-2 mt-4">
                    <Label>Select SADC Country *</Label>
                    <Select
                      value={formData.sadcCountry}
                      onValueChange={(value) => handleInputChange("sadcCountry", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="-- Choose a country --" />
                      </SelectTrigger>
                      <SelectContent>
                        {sadcCountries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.sadcCountry && SADC_DISTANCES[formData.sadcCountry] && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Distance from Johannesburg: <span className="font-semibold text-foreground">{SADC_DISTANCES[formData.sadcCountry]} km</span>
                      </p>
                    )}
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
