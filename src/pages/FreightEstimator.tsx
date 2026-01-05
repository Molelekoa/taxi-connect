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

// SADC country data: distances from Johannesburg (in km) and capital coordinates
const SADC_DATA: Record<string, { distance: number; coordinates: { lng: number; lat: number }; capital: string; corridorPrice: { min: number; max: number } }> = {
  'botswana': { distance: 356, coordinates: { lng: 25.9123, lat: -24.6282 }, capital: 'Gaborone', corridorPrice: { min: 4500, max: 8000 } },
  'lesotho': { distance: 410.7, coordinates: { lng: 27.4833, lat: -29.3167 }, capital: 'Maseru', corridorPrice: { min: 4000, max: 7000 } },
  'mozambique': { distance: 545.1, coordinates: { lng: 32.5892, lat: -25.9655 }, capital: 'Maputo', corridorPrice: { min: 5000, max: 9000 } },
  'namibia': { distance: 1625.4, coordinates: { lng: 17.0836, lat: -22.5609 }, capital: 'Windhoek', corridorPrice: { min: 8000, max: 14000 } },
  'eswatini': { distance: 398.2, coordinates: { lng: 31.1367, lat: -26.3054 }, capital: 'Manzini', corridorPrice: { min: 4000, max: 7000 } },
  'zambia': { distance: 1732.6, coordinates: { lng: 28.2871, lat: -15.3875 }, capital: 'Lusaka', corridorPrice: { min: 9000, max: 16000 } },
  'zimbabwe': { distance: 1121.3, coordinates: { lng: 31.0522, lat: -17.8292 }, capital: 'Harare', corridorPrice: { min: 6500, max: 12000 } },
};

// Johannesburg coordinates for cross-border origin
const JHB_COORDINATES = { lng: 28.0473, lat: -26.2041 };

// ==========================================
// PRICING CONSTANTS
// ==========================================

/** Base rates for freight calculation */
const BASE_RATES = {
  // Domestic per-km rates (ZAR)
  domestic: { min: 4.5, max: 12 },
  // LTL per-kg rates (ZAR)
  ltlPerKg: { min: 8, max: 15 },
  // Cross-border per-km rates (ZAR) for FTL - reduced to industry-aligned rates
  crossBorder: { min: 3, max: 6 },
  // Minimum charge thresholds (ZAR)
  minimumCharge: { min: 1500, max: 2500 },
} as const;

/** Surcharges and multipliers */
const SURCHARGES = {
  // FTL discount multipliers
  ftlDiscount: { min: 0.85, max: 0.9 },
  // Cross-border LTL multiplier - reduced from 1.5 to 1.2
  crossBorderLtlMultiplier: 1.2,
  // Express delivery multiplier
  express: 1.25,
  // Temperature controlled multiplier
  tempControlled: 1.3,
  // Extra insurance multiplier
  extraInsurance: 1.08,
} as const;

/** Insurance pricing - base rate is wholesale cost from insurer */
const INSURANCE = {
  baseRate: 0.003,          // 0.3% - Wholesale cost
  profitMarkup: 1.3,        // 30% markup for profit
  riskMultipliers: {
    hazardous: 1.8,         // +80% for hazardous materials
    highvalue: 1.4,         // +40% for high-value goods
    crossborder: 1.25,      // +25% for SADC cross-border
    tempcontrol: 1.15       // +15% for temperature control
  }
} as const;

/** Fixed fees (ZAR) */
const FEES = {
  liftgate: 650,
  securityEscort: 2500,
  liveTracking: 150,
  crossBorderAdmin: 1200,
} as const;

/** Country-specific customs rates (VAT, average duty, admin fee) */
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
    goodsValue: "",
  });

  const [showResult, setShowResult] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [finalDistance, setFinalDistance] = useState(0);
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
    ? SADC_DATA[formData.sadcCountry]?.distance || 0
    : mapboxDistance;

  // Get cross-border coordinates for map visualization
  const crossBorderCoordinates = formData.crossBorder && formData.sadcCountry
    ? {
        pickup: JHB_COORDINATES,
        delivery: SADC_DATA[formData.sadcCountry]?.coordinates || null,
        deliveryLabel: SADC_DATA[formData.sadcCountry]?.capital || 'Destination'
      }
    : null;

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

    // Use Mapbox distance for domestic, SADC predefined for cross-border
    let distance = effectiveDistance || 500; // Fallback to 500km if no distance
    
    // Domestic base cost calculation
    let minCost = distance * BASE_RATES.domestic.min * cargoMultiplier;
    let maxCost = distance * BASE_RATES.domestic.max * cargoMultiplier;

    // APPLY CROSS-BORDER COSTS (if selected)
    if (formData.crossBorder) {
      const selectedCountry = formData.sadcCountry;
      if (selectedCountry && SADC_DATA[selectedCountry]) {
        const sadcData = SADC_DATA[selectedCountry];
        distance = sadcData.distance;

        // Override the base cost calculation for cross-border
        if (isFTL) {
          // Use corridor pricing for FTL - more realistic route-based flat rates
          minCost = sadcData.corridorPrice.min * cargoMultiplier;
          maxCost = sadcData.corridorPrice.max * cargoMultiplier;
        } else {
          // For LTL, use per-kg with reduced cross-border multiplier
          minCost = weight * BASE_RATES.ltlPerKg.min * SURCHARGES.crossBorderLtlMultiplier * cargoMultiplier;
          maxCost = weight * BASE_RATES.ltlPerKg.max * SURCHARGES.crossBorderLtlMultiplier * cargoMultiplier;
        }

        // Add the fixed admin fee
        minCost += FEES.crossBorderAdmin;
        maxCost += FEES.crossBorderAdmin;
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
      minCost *= SURCHARGES.ftlDiscount.min;
      maxCost *= SURCHARGES.ftlDiscount.max;
    }

    // Add special requirements - Fixed fees
    if (formData.liftgate) {
      minCost += FEES.liftgate;
      maxCost += FEES.liftgate;
    }
    if (formData.securityEscort) {
      minCost += FEES.securityEscort;
      maxCost += FEES.securityEscort;
    }
    if (formData.liveTracking) {
      minCost += FEES.liveTracking;
      maxCost += FEES.liveTracking;
    }

    // Add special requirements - Multipliers
    if (formData.express) {
      minCost *= SURCHARGES.express;
      maxCost *= SURCHARGES.express;
    }
    if (formData.tempControlled) {
      minCost *= SURCHARGES.tempControlled;
      maxCost *= SURCHARGES.tempControlled;
    }
    if (formData.extraInsurance) {
      minCost *= SURCHARGES.extraInsurance;
      maxCost *= SURCHARGES.extraInsurance;
    }

    
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
    minCost = Math.max(minCost, BASE_RATES.minimumCharge.min);
    maxCost = Math.max(maxCost, BASE_RATES.minimumCharge.max);

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

                  {/* Route Map - Domestic */}
                  {!formData.crossBorder && (
                    <RouteMap
                      pickupCoordinates={pickupCoordinates}
                      deliveryCoordinates={deliveryCoordinates}
                      pickupLabel={pickupPlace || 'Pickup'}
                      deliveryLabel={deliveryPlace || 'Delivery'}
                    />
                  )}

                  {/* Route Map - Cross-border SADC */}
                  {formData.crossBorder && crossBorderCoordinates?.delivery && (
                    <RouteMap
                      pickupCoordinates={crossBorderCoordinates.pickup}
                      deliveryCoordinates={crossBorderCoordinates.delivery}
                      pickupLabel="Johannesburg"
                      deliveryLabel={crossBorderCoordinates.deliveryLabel}
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
                    {formData.crossBorder && (
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
                          <p className="text-xs text-muted-foreground">Estimated duties, VAT & admin fees</p>
                        </div>
                      </div>
                    )}
                    {formData.crossBorder && formData.customsClearing && (
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
                    {formData.sadcCountry && SADC_DATA[formData.sadcCountry] && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Distance from Johannesburg: <span className="font-semibold text-foreground">{SADC_DATA[formData.sadcCountry].distance} km</span>
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
                            <span className="text-foreground">R{FEES.liftgate.toLocaleString()}</span>
                          </li>
                        )}
                        {formData.securityEscort && (
                          <li className="flex justify-between">
                            <span>Security escort</span>
                            <span className="text-foreground">R{FEES.securityEscort.toLocaleString()}</span>
                          </li>
                        )}
                        {formData.liveTracking && (
                          <li className="flex justify-between">
                            <span>Live tracking</span>
                            <span className="text-foreground">R{FEES.liveTracking.toLocaleString()}</span>
                          </li>
                        )}
                        {formData.crossBorder && (
                          <li className="flex justify-between">
                            <span>Cross-border admin fee</span>
                            <span className="text-foreground">R{FEES.crossBorderAdmin.toLocaleString()}</span>
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
