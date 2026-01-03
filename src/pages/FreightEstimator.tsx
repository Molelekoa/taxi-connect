import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
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
import { useMapboxDistance } from "@/hooks/useMapboxDistance";
import RouteMap from "@/components/RouteMap";

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

// SADC country distances from Johannesburg (in km) - used as fallback for cross-border
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

// Value-added service costs
const LIVE_TRACKING_FEE = 150; // R150 per load

// Country-specific customs rates (VAT, average duty, admin fee)
const CUSTOMS_RATES: Record<string, { vat: number; avgDuty: number; adminFee: number }> = {
  'lesotho': { vat: 0.15, avgDuty: 0.10, adminFee: 2000 },
  'botswana': { vat: 0.15, avgDuty: 0.10, adminFee: 500 },
  'namibia': { vat: 0.15, avgDuty: 0.10, adminFee: 500 },
  'eswatini': { vat: 0.15, avgDuty: 0.10, adminFee: 500 },
  'zambia': { vat: 0.16, avgDuty: 0.10, adminFee: 500 },
  'mozambique': { vat: 0.17, avgDuty: 0.10, adminFee: 500 },
  'zimbabwe': { vat: 0.15, avgDuty: 0.10, adminFee: 500 },
};

// Calculate customs clearing estimate
const calculateCustomsEstimate = (goodsValue: number, destinationCountry: string): number => {
  const rates = CUSTOMS_RATES[destinationCountry];
  if (!rates || goodsValue <= 0) return 0;
  
  const dutyOwed = goodsValue * rates.avgDuty;
  const vatBase = goodsValue + dutyOwed;
  const vatOwed = vatBase * rates.vat;
  const totalEstimate = dutyOwed + vatOwed + rates.adminFee;
  
  return Math.round(totalEstimate);
};

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
    liveTracking: false,
    customsClearing: false,
    insuranceCover: false,
    goodsValue: "",
  });

  const [showResult, setShowResult] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [finalDistance, setFinalDistance] = useState(0);
  const [insuranceCost, setInsuranceCost] = useState(0);
  const [customsCost, setCustomsCost] = useState(0);

  // Use Mapbox for domestic routes (skip for cross-border)
  const { 
    distance: mapboxDistance, 
    isLoading: isCalculatingDistance, 
    error: distanceError,
    pickupPlace,
    deliveryPlace,
    pickupCoordinates,
    deliveryCoordinates
  } = useMapboxDistance(
    formData.pickupLocation,
    formData.deliveryLocation,
    formData.crossBorder // Skip API when cross-border is selected
  );

  // Calculate the effective distance
  const effectiveDistance = formData.crossBorder && formData.sadcCountry
    ? SADC_DISTANCES[formData.sadcCountry] || 0
    : mapboxDistance;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setShowResult(false); // Hide result when form changes
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

    // Use Mapbox distance for domestic, SADC predefined for cross-border
    let distance = effectiveDistance || 500; // Fallback to 500km if no distance
    
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

    setFinalDistance(distance);

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
    if (formData.liveTracking) {
      minCost += LIVE_TRACKING_FEE;
      maxCost += LIVE_TRACKING_FEE;
    }
    // Insurance cover calculation
    let calculatedInsuranceCost = 0;
    if (formData.insuranceCover) {
      const goodsValue = parseFloat(formData.goodsValue) || 0;
      if (goodsValue > 0) {
        // Base rate 0.3%
        let insuranceRate = 0.003;
        // Adjust rate upwards for high-risk cargo or routes
        if (formData.cargoType === 'hazardous' || formData.cargoType === 'highvalue') {
          insuranceRate += 0.001;
        }
        if (formData.crossBorder) {
          insuranceRate += 0.0005;
        }
        calculatedInsuranceCost = goodsValue * insuranceRate;
        minCost += calculatedInsuranceCost;
        maxCost += calculatedInsuranceCost;
      }
    }
    setInsuranceCost(calculatedInsuranceCost);
    
    // Customs clearing calculation
    let calculatedCustomsCost = 0;
    if (formData.customsClearing && formData.crossBorder && formData.sadcCountry) {
      const goodsValue = parseFloat(formData.goodsValue) || 0;
      calculatedCustomsCost = calculateCustomsEstimate(goodsValue, formData.sadcCountry);
      minCost += calculatedCustomsCost;
      maxCost += calculatedCustomsCost;
    }
    setCustomsCost(calculatedCustomsCost);

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

                  {/* Distance calculation status */}
                  {isCalculatingDistance && (
                    <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calculating distance...
                    </div>
                  )}
                  
                  {distanceError && !formData.crossBorder && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                      {distanceError}
                    </div>
                  )}
                  
                  {effectiveDistance && effectiveDistance > 0 && !isCalculatingDistance && (
                    <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Estimated distance:</span>
                        <span className="font-semibold text-foreground">{effectiveDistance} km</span>
                      </div>
                      {pickupPlace && deliveryPlace && !formData.crossBorder && (
                        <div className="text-xs mt-2 space-y-1">
                          <div>From: {pickupPlace}</div>
                          <div>To: {deliveryPlace}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Route Map */}
                  {!formData.crossBorder && (
                    <RouteMap
                      pickupCoordinates={pickupCoordinates}
                      deliveryCoordinates={deliveryCoordinates}
                      pickupLabel={pickupPlace || 'Pickup'}
                      deliveryLabel={deliveryPlace || 'Delivery'}
                    />
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

                {/* Value-Added Services */}
                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-3">Value-Added Services</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="liveTracking"
                        checked={formData.liveTracking}
                        onCheckedChange={(checked) =>
                          handleInputChange("liveTracking", checked === true)
                        }
                      />
                      <div>
                        <Label htmlFor="liveTracking" className="cursor-pointer font-normal">
                          Live Tracking
                        </Label>
                        <p className="text-xs text-muted-foreground">R150 per load — view online via tracking link</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="insuranceCover"
                        checked={formData.insuranceCover}
                        onCheckedChange={(checked) =>
                          handleInputChange("insuranceCover", checked === true)
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="insuranceCover" className="cursor-pointer font-normal">
                          Insurance Cover
                        </Label>
                      </div>
                    </div>
                    {formData.insuranceCover && (
                      <div className="sm:col-span-2 pl-6 space-y-2">
                        <Label htmlFor="goodsValue">Declared Goods Value (R)*</Label>
                        <Input
                          id="goodsValue"
                          type="number"
                          placeholder="e.g., 50000"
                          min="1"
                          value={formData.goodsValue}
                          onChange={(e) => handleInputChange("goodsValue", e.target.value)}
                        />
                      </div>
                    )}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="customsClearing"
                        checked={formData.customsClearing}
                        onCheckedChange={(checked) =>
                          handleInputChange("customsClearing", checked === true)
                        }
                      />
                      <div>
                        <Label htmlFor="customsClearing" className="cursor-pointer font-normal">
                          Customs Clearing
                        </Label>
                      </div>
                    </div>
                  </div>
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

                  <div className="bg-card p-5 rounded-lg mt-6 space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-foreground mb-2">Cost Breakdown:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li className="flex justify-between">
                          <span>Base freight (~{finalDistance} km)</span>
                          <span className="text-foreground">Included</span>
                        </li>
                        {formData.liftgate && (
                          <li className="flex justify-between">
                            <span>Liftgate service</span>
                            <span className="text-foreground">R650</span>
                          </li>
                        )}
                        {formData.securityEscort && (
                          <li className="flex justify-between">
                            <span>Security escort</span>
                            <span className="text-foreground">R2,500</span>
                          </li>
                        )}
                        {formData.liveTracking && (
                          <li className="flex justify-between">
                            <span>Live tracking</span>
                            <span className="text-foreground">R150</span>
                          </li>
                        )}
                        {formData.insuranceCover && insuranceCost > 0 && (
                          <li className="flex justify-between">
                            <span>Insurance cover</span>
                            <span className="text-foreground">R{insuranceCost.toFixed(2)}</span>
                          </li>
                        )}
                        {formData.crossBorder && (
                          <li className="flex justify-between">
                            <span>Cross-border admin fee</span>
                            <span className="text-foreground">R1,200</span>
                          </li>
                        )}
                        {formData.customsClearing && customsCost > 0 && (
                          <li className="flex justify-between">
                            <span>Customs clearing</span>
                            <span className="text-foreground">R{customsCost.toLocaleString()}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="border-t border-border pt-3">
                      <p className="font-semibold text-foreground mb-2">Included in estimate:</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Standard road freight</li>
                        <li>• Fuel levy (current surcharge)</li>
                        <li>• Basic cargo liability</li>
                        {formData.isFullTruckload && <li>• Full truckload discount applied</li>}
                        {formData.express && <li>• Express delivery surcharge</li>}
                        {formData.tempControlled && <li>• Temperature controlled surcharge</li>}
                      </ul>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
                    <strong>Disclaimer:</strong> This is an automated estimate only. Actual pricing will be confirmed by our team after reviewing your full shipment details. Additional fees may apply for access restrictions, waiting time, or special handling.
                  </p>

                  {formData.customsClearing && (
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed italic">
                      Customs estimates are based on standard rates. Final charges are determined by the destination country's authority and may vary.
                    </p>
                  )}

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
