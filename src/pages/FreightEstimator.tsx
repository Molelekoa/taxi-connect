import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Info, Package, Radio, AlertTriangle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WeightBandSelector from "@/components/WeightBandSelector";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMapboxDistance } from "@/hooks/useMapboxDistance";
import RouteMap from "@/components/RouteMap";
import { Checkbox } from "@/components/ui/checkbox";
import {
  calculateBandPrice,
  WEIGHT_BANDS,
  getWeightBand,
  TRACKING_FEE,
  type PriceBreakdown,
} from "@/config/pricingCalculator";

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

// Common city options for quick selection
const POPULAR_CITIES = [
  { value: "Johannesburg", label: "Johannesburg" },
  { value: "Pretoria", label: "Pretoria" },
  { value: "Durban", label: "Durban" },
  { value: "Bloemfontein", label: "Bloemfontein" },
  { value: "Cape Town", label: "Cape Town" },
  { value: "Maseru", label: "Maseru (Lesotho)" },
  { value: "Harare", label: "Harare (Zimbabwe)" },
  { value: "Bulawayo", label: "Bulawayo (Zimbabwe)" },
];

const ParcelEstimator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pickupLocation: "",
    deliveryLocation: "",
    weightBand: "",
    includeTracking: false,
  });

  const [showResult, setShowResult] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
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

  // Calculate the effective distance - prefer Mapbox, fallback to SADC data
  const effectiveDistance = mapboxDistance 
    || (detectedCrossBorder ? SADC_DATA[detectedCrossBorder]?.distance : null);

  // Get cross-border coordinates for map visualization - use actual geocoded coords when available
  const crossBorderCoordinates = detectedCrossBorder
    ? {
        pickup: pickupCoordinates || JHB_COORDINATES,
        delivery: deliveryCoordinates || SADC_DATA[detectedCrossBorder]?.coordinates || null,
        deliveryLabel: deliveryPlace || SADC_DATA[detectedCrossBorder]?.capital || 'Destination'
      }
    : null;


  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setShowResult(false);
  };

  const calculateEstimate = () => {
    if (!formData.weightBand) return;
    if (!formData.pickupLocation || !formData.deliveryLocation) return;

    const result = calculateBandPrice(
      formData.pickupLocation,
      formData.deliveryLocation,
      formData.weightBand,
      effectiveDistance || undefined,
      formData.includeTracking
    );

    if (result) {
      setPriceBreakdown(result);
      setShowResult(true);
    }
  };

  const isFormValid =
    formData.pickupLocation &&
    formData.deliveryLocation &&
    formData.weightBand;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container-narrow max-w-3xl mx-auto">
          {/* Header */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
            <div className="bg-primary text-primary-foreground p-6 md:p-8">
              <h1 className="font-display font-bold text-2xl md:text-3xl mb-2">
                Parcolo Pricing
              </h1>
              <p className="text-primary-foreground/80">
                Get instant pricing for parcels 1–20 kg. Our optimized routes mean lower costs for you.
              </p>
            </div>

            <div className="p-6 md:p-8 space-y-8">

              {/* Route Selection */}
              <section className="space-y-6 pb-8 border-b border-border">
                <h2 className="font-display font-bold text-xl text-foreground">
                  Route & Parcel Details
                </h2>

                <div className="grid gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="pickup">Origin City *</Label>
                    <Select
                      value={formData.pickupLocation}
                      onValueChange={(value) => handleInputChange("pickupLocation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select origin city" />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_CITIES.map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {city.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Or type a custom location:</p>
                    <Input
                      id="pickup"
                      placeholder="e.g., Randburg, Midrand"
                      value={formData.pickupLocation}
                      onChange={(e) => handleInputChange("pickupLocation", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delivery">Destination City *</Label>
                    <Select
                      value={formData.deliveryLocation}
                      onValueChange={(value) => handleInputChange("deliveryLocation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination city" />
                      </SelectTrigger>
                      <SelectContent>
                        {POPULAR_CITIES.map((city) => (
                          <SelectItem key={city.value} value={city.value}>
                            {city.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Or type a custom location:</p>
                    <Input
                      id="delivery"
                      placeholder="e.g., Maseru, Harare"
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
                      pickupLabel={pickupPlace || formData.pickupLocation || 'Origin'}
                      deliveryLabel={crossBorderCoordinates.deliveryLabel}
                    />
                  )}

                  <div className="space-y-2">
                    <Label>Parcel Weight *</Label>
                    <WeightBandSelector
                      value={formData.weightBand}
                      onChange={(bandId) => handleInputChange("weightBand", bandId)}
                    />
                  </div>

                  {/* Weight verification notice */}
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Your parcel will be weighed at collection. If the actual weight falls in a different band, the price will be adjusted accordingly.
                    </p>
                  </div>

                  {/* Tracking Add-on */}
                  <div className="bg-secondary/50 border border-border rounded-lg p-4 col-span-full">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="includeTracking"
                        checked={formData.includeTracking}
                        onCheckedChange={(checked) => handleInputChange("includeTracking", checked === true)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label 
                          htmlFor="includeTracking" 
                          className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        >
                          <Radio className="w-4 h-4 text-primary" />
                          Get Tracking Link
                          <span className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                            +R{TRACKING_FEE}
                          </span>
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Receive a unique tracking link you can share with the recipient.
                        </p>
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
                  Calculate My Price
                </Button>
              </div>

              {/* Price Result */}
              {showResult && priceBreakdown && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 md:p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-display font-bold text-lg text-foreground">Your Parcel Price</span>
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {priceBreakdown.distanceCategory}
                    </span>
                  </div>

                  <div className="text-4xl md:text-5xl font-display font-black text-primary my-4">
                    R {priceBreakdown.finalPrice.toLocaleString()}
                  </div>
                  

                  {/* Summary */}
                  <div className="bg-background/50 rounded-lg p-4 space-y-2 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route</span>
                      <span className="text-foreground">{priceBreakdown.route}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight Band</span>
                      <span className="text-foreground">
                        {getWeightBand(formData.weightBand)?.label ?? ""} ({getWeightBand(formData.weightBand)?.range[0]}–{getWeightBand(formData.weightBand)?.range[1]} kg)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <span className="text-foreground">{priceBreakdown.distanceCategory}</span>
                    </div>
                    {priceBreakdown.trackingIncluded && (
                      <div className="flex justify-between text-primary font-medium">
                        <span>Tracking Link</span>
                        <span>+R{priceBreakdown.trackingFee}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <Button 
                      variant="hero" 
                      size="lg"
                      onClick={() => navigate('/small-parcel', { 
                        state: { 
                          origin: formData.pickupLocation,
                          destination: formData.deliveryLocation, 
                          weightBand: formData.weightBand,
                          weight: getWeightBand(formData.weightBand)?.midpoint,
                          price: priceBreakdown.finalPrice,
                          includeTracking: formData.includeTracking,
                          distance: effectiveDistance
                        }
                      })}
                    >
                      Book This Delivery
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    <strong>Note:</strong> Final price confirmed at booking. Cross-border deliveries may be subject to customs requirements.
                  </p>
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
