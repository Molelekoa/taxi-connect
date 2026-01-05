import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Info } from "lucide-react";
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

// SADC country data: distances from Johannesburg (in km) and capital coordinates
const SADC_DATA: Record<string, { distance: number; coordinates: { lng: number; lat: number }; capital: string }> = {
  'botswana': { distance: 356, coordinates: { lng: 25.9123, lat: -24.6282 }, capital: 'Gaborone' },
  'lesotho': { distance: 410.7, coordinates: { lng: 27.4833, lat: -29.3167 }, capital: 'Maseru' },
  'mozambique': { distance: 545.1, coordinates: { lng: 32.5892, lat: -25.9655 }, capital: 'Maputo' },
  'namibia': { distance: 1625.4, coordinates: { lng: 17.0836, lat: -22.5609 }, capital: 'Windhoek' },
  'eswatini': { distance: 398.2, coordinates: { lng: 31.1367, lat: -26.3054 }, capital: 'Manzini' },
  'zambia': { distance: 1732.6, coordinates: { lng: 28.2871, lat: -15.3875 }, capital: 'Lusaka' },
  'zimbabwe': { distance: 1121.3, coordinates: { lng: 31.0522, lat: -17.8292 }, capital: 'Harare' },
};

// Johannesburg coordinates for cross-border origin
const JHB_COORDINATES = { lng: 28.0473, lat: -26.2041 };

// Map country codes to SADC keys
const COUNTRY_CODE_TO_SADC: Record<string, string> = {
  'BW': 'botswana',
  'LS': 'lesotho',
  'MZ': 'mozambique',
  'NA': 'namibia',
  'SZ': 'eswatini',
  'ZM': 'zambia',
  'ZW': 'zimbabwe',
};

// ==========================================
// PRICING CONSTANTS
// ==========================================

/** Base rates for freight calculation */
const BASE_RATES = {
  // Per-km rates (ZAR) - same for all routes
  perKm: { min: 4.5, max: 12 },
  // Minimum charge thresholds (ZAR)
  minimumCharge: { min: 1500, max: 2500 },
} as const;

/** Surcharges and multipliers */
const SURCHARGES = {
  // FTL discount multipliers
  ftlDiscount: { min: 0.85, max: 0.9 },
  // Express delivery multiplier
  express: 1.25,
  // Temperature controlled multiplier
  tempControlled: 1.3,
} as const;

/** Fixed fees (ZAR) */
const FEES = {
  liftgate: 650,
  securityEscort: 2500,
  liveTracking: 150,
} as const;

/** Calculate weight premium: 5% for every 100kg over 500kg */
const calculateWeightPremium = (weight: number): { multiplier: number; percentage: number } => {
  if (weight <= 500) return { multiplier: 1.0, percentage: 0 };
  const incrementsOver500 = Math.ceil((weight - 500) / 100);
  const percentage = incrementsOver500 * 5;
  return { multiplier: 1 + (percentage / 100), percentage };
};

const FreightEstimator = () => {
  const [formData, setFormData] = useState({
    pickupLocation: "",
    deliveryLocation: "",
    weight: "",
    cargoType: "",
    isFullTruckload: false,
    liftgate: false,
    express: false,
    tempControlled: false,
    securityEscort: false,
    liveTracking: false,
  });

  const [showResult, setShowResult] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [finalDistance, setFinalDistance] = useState(0);
  const [weightPremiumInfo, setWeightPremiumInfo] = useState({ percentage: 0, amount: 0 });
  const [detectedCrossBorder, setDetectedCrossBorder] = useState<string | null>(null);

  // Use Mapbox for route calculation
  const { 
    distance: mapboxDistance, 
    isLoading: isCalculatingDistance, 
    error: distanceError,
    pickupPlace,
    deliveryPlace,
    pickupCoordinates,
    deliveryCoordinates,
    deliveryCountry
  } = useMapboxDistance(
    formData.pickupLocation,
    formData.deliveryLocation
  );

  // Auto-detect cross-border routes
  useEffect(() => {
    if (deliveryCountry && deliveryCountry !== 'ZA') {
      const sadcKey = COUNTRY_CODE_TO_SADC[deliveryCountry];
      if (sadcKey) {
        setDetectedCrossBorder(sadcKey);
      } else {
        setDetectedCrossBorder(null);
      }
    } else {
      setDetectedCrossBorder(null);
    }
  }, [deliveryCountry]);

  // Calculate the effective distance
  const effectiveDistance = detectedCrossBorder
    ? SADC_DATA[detectedCrossBorder]?.distance || mapboxDistance
    : mapboxDistance;

  // Get cross-border coordinates for map visualization
  const crossBorderCoordinates = detectedCrossBorder
    ? {
        pickup: JHB_COORDINATES,
        delivery: SADC_DATA[detectedCrossBorder]?.coordinates || null,
        deliveryLabel: SADC_DATA[detectedCrossBorder]?.capital || 'Destination'
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

    // Use Mapbox distance or SADC predefined distance
    const distance = effectiveDistance || 500; // Fallback to 500km if no distance
    
    setFinalDistance(distance);

    // Base cost calculation (same per-km rate for all routes)
    let minCost = distance * BASE_RATES.perKm.min * cargoMultiplier;
    let maxCost = distance * BASE_RATES.perKm.max * cargoMultiplier;

    // Apply weight premium (5% per 100kg over 500kg)
    const { multiplier: weightMultiplier, percentage: weightPercentage } = calculateWeightPremium(weight);
    const premiumAmountMin = minCost * (weightMultiplier - 1);
    const premiumAmountMax = maxCost * (weightMultiplier - 1);
    minCost *= weightMultiplier;
    maxCost *= weightMultiplier;
    
    setWeightPremiumInfo({ 
      percentage: weightPercentage, 
      amount: Math.round((premiumAmountMin + premiumAmountMax) / 2) 
    });

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

                  {/* Distance calculation status */}
                  {isCalculatingDistance && (
                    <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calculating distance...
                    </div>
                  )}
                  
                  {distanceError && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                      {distanceError}
                    </div>
                  )}

                  {/* Cross-border detection notice */}
                  {detectedCrossBorder && (
                    <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-sm flex items-start gap-2">
                      <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">Cross-border route detected</span>
                        <span className="text-muted-foreground"> — Delivery to {SADC_DATA[detectedCrossBorder]?.capital}, {detectedCrossBorder.charAt(0).toUpperCase() + detectedCrossBorder.slice(1)}</span>
                      </div>
                    </div>
                  )}
                  
                  {effectiveDistance && effectiveDistance > 0 && !isCalculatingDistance && (
                    <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Estimated distance:</span>
                        <span className="font-semibold text-foreground">{effectiveDistance} km</span>
                      </div>
                      {pickupPlace && deliveryPlace && !detectedCrossBorder && (
                        <div className="text-xs mt-2 space-y-1">
                          <div>From: {pickupPlace}</div>
                          <div>To: {deliveryPlace}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Route Map - Domestic */}
                  {!detectedCrossBorder && (
                    <RouteMap
                      pickupCoordinates={pickupCoordinates}
                      deliveryCoordinates={deliveryCoordinates}
                      pickupLabel={pickupPlace || 'Pickup'}
                      deliveryLabel={deliveryPlace || 'Delivery'}
                    />
                  )}

                  {/* Route Map - Cross-border SADC */}
                  {detectedCrossBorder && crossBorderCoordinates?.delivery && (
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
                    <p className="text-xs text-muted-foreground">
                      Weight premium applies: +5% for every 100kg over 500kg
                    </p>
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
                    { id: "express", label: "Express delivery (within 48hrs)" },
                    { id: "tempControlled", label: "Temperature controlled" },
                    { id: "securityEscort", label: "Security escort requested" },
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
                  </div>
                </div>
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
                        {weightPremiumInfo.percentage > 0 && (
                          <li className="flex justify-between">
                            <span>Weight premium (+{weightPremiumInfo.percentage}%)</span>
                            <span className="text-foreground">~R{weightPremiumInfo.amount.toLocaleString()}</span>
                          </li>
                        )}
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
