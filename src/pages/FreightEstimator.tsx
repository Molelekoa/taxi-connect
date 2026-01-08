import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Info, Package } from "lucide-react";
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
import { PARCEL_SERVICE, getParcelPrice, isEligibleOrigin, type ParcelDestination } from "@/config/parcelService";

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

// Parcel service constants are now imported from @/config/parcelService

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

/** Calculate weight adjustment: discount for light packages, premium for heavy */
const calculateWeightMultiplier = (weight: number): number => {
  // 50% discount for packages under 50kg
  if (weight < 50) return 0.5;
  // 5% premium for every 100kg over 500kg
  if (weight <= 500) return 1.0;
  const incrementsOver500 = Math.ceil((weight - 500) / 100);
  return 1 + (incrementsOver500 * 0.05);
};

const ParcelEstimator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pickupLocation: "",
    deliveryLocation: "",
    weight: "",
    cargoType: "general",
    isFullTruckload: false,
    liftgate: false,
    express: false,
    tempControlled: false,
    securityEscort: false,
    liveTracking: false,
  });

  const [showResult, setShowResult] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [detectedCrossBorder, setDetectedCrossBorder] = useState<string | null>(null);

  // Check parcel service eligibility
  const parcelOffer = useMemo(() => {
    const weight = parseFloat(formData.weight);

    // Check origin eligibility using shared function
    const originEligible = isEligibleOrigin(formData.pickupLocation);

    // Check destination eligibility (Lesotho or Zimbabwe only)
    const isLesotho = detectedCrossBorder === 'lesotho';
    const isZimbabwe = detectedCrossBorder === 'zimbabwe';
    const destination: ParcelDestination | null = isLesotho ? 'lesotho' : isZimbabwe ? 'zimbabwe' : null;

    // Check weight eligibility
    const isEligibleWeight = weight >= 1 && weight <= PARCEL_SERVICE.maxWeight;

    if (!originEligible || !destination || !isEligibleWeight) {
      return { eligible: false, price: null, destination: null };
    }

    // Get pricing using shared function
    const price = getParcelPrice(destination, weight);

    return {
      eligible: true,
      price,
      destination: isLesotho ? 'Lesotho' : 'Zimbabwe',
      destinationKey: destination
    };
  }, [formData.pickupLocation, formData.weight, detectedCrossBorder]);

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

    // Base cost calculation (same per-km rate for all routes)
    let minCost = distance * BASE_RATES.perKm.min * cargoMultiplier;
    let maxCost = distance * BASE_RATES.perKm.max * cargoMultiplier;

    // Apply weight multiplier (discount or premium)
    const weightMultiplier = calculateWeightMultiplier(weight);
    minCost *= weightMultiplier;
    maxCost *= weightMultiplier;

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
            <div className="bg-primary text-primary-foreground p-6 md:p-8">
              <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">
                CourierConnect Parcel Pricing
              </h1>
              <p className="text-primary-foreground/80">
                Get instant pricing for your parcel. We use taxi and bus networks for affordable, reliable delivery.
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
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30 border border-border hover:border-primary/30 transition-colors">
                      <Checkbox
                        id="liveTracking"
                        checked={formData.liveTracking}
                        onCheckedChange={(checked) =>
                          handleInputChange("liveTracking", checked === true)
                        }
                      />
                      <div className="flex-1">
                        <Label htmlFor="liveTracking" className="cursor-pointer font-normal flex items-center gap-2">
                          Live Tracking
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Popular</span>
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">R150 per load — Real-time visibility for you and your customers</p>
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

              {/* Parcel Service Offer */}
              {showResult && parcelOffer.eligible && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 md:p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-display font-bold text-lg text-foreground">Small Parcel Express</span>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Best Value</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    Great news! Your {formData.weight}kg shipment to {parcelOffer.destination} qualifies for our fixed-rate small parcel service.
                  </p>

                  <div className="text-4xl md:text-5xl font-display font-black text-primary my-4">
                    R {parcelOffer.price?.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fixed rate — no surprises
                  </p>

                  <div className="text-center mt-6">
                    <Button 
                      variant="hero" 
                      size="lg"
                      onClick={() => navigate('/small-parcel', { 
                        state: { 
                          destination: parcelOffer.destinationKey, 
                          weight: parseFloat(formData.weight) 
                        } 
                      })}
                    >
                      Book Small Parcel Delivery
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Regular Freight Results */}
              {showResult && !parcelOffer.eligible && (
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

export default ParcelEstimator;
