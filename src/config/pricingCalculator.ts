// ==========================================
// PARCOLO PRICING ENGINE
// INTERNAL USE ONLY - DO NOT EXPOSE TO UI
// ==========================================

/**
 * Route pricing database (in ZAR).
 * Keys are route tuples [origin, destination] - bidirectional lookup supported.
 * NOTE: These values and the calculation logic are INTERNAL and should NOT be shown in the UI.
 */
export const ROUTE_PRICING_DATABASE: Record<string, number> = {
  // South Africa to Zimbabwe (Long Distance)
  "Johannesburg-Harare": 1200.00,
  "Johannesburg-Bulawayo": 1100.00,
  "Pretoria-Harare": 1250.00,
  
  // South Africa to Lesotho (Medium Distance)
  "Johannesburg-Maseru": 250.00,
  "Bloemfontein-Maseru": 150.00,
  "Durban-Maseru": 500.00,
  
  // Domestic South Africa
  "Johannesburg-Pretoria": 120.00,
  "Johannesburg-Durban": 500.00,
  "Johannesburg-Bloemfontein": 350.00,
  "Pretoria-Durban": 550.00,
};

/** Handling fee added to every delivery (ZAR) */
export const HANDLING_FEE = 25.00;

/** Price multiplier (150% increase = 2.5x) */
export const PRICE_MULTIPLIER = 2.50;

/** Minimum price floor (ZAR) */
export const MINIMUM_PRICE = 135.00;

/** Envelope-specific minimum price (ZAR) */
export const ENVELOPE_MINIMUM_PRICE = 175.00;

/** Band multipliers: every non-envelope band is a multiple of the envelope price */
export const BAND_MULTIPLIERS: Record<string, number> = {
  envelope: 1.0,
  light: 2.0,
  medium: 2.5,
  heavy: 3.0,
  "extra-heavy": 3.5,
};

/** Parcel tracking add-on fee (ZAR) */
export const TRACKING_FEE = 100.00;

/** Long-distance discount threshold (km) */
export const LONG_DISTANCE_DISCOUNT_THRESHOLD_KM = 800;

/** Long-distance discount factor (0.80 = 20% reduction) */
export const LONG_DISTANCE_DISCOUNT_FACTOR = 0.80;

/** Fallback fare per km when route not in database */
export const FALLBACK_FARE_PER_KM = 1.50;

/** Distance threshold for pricing adjustment (km) */
export const DISTANCE_ADJUSTMENT_THRESHOLD_KM = 200;

/** Price adjustment factor for long distances (0.65 = 35% reduction) */
export const DISTANCE_ADJUSTMENT_FACTOR = 0.65;

/** Default estimated distance for unknown routes (km) */
export const DEFAULT_DISTANCE_KM = 400;

/** Weight limits for parcel service */
export const WEIGHT_LIMITS = {
  min: 0,
  max: 50,
} as const;

/** Envelope band discount factor (15% cheaper) */
export const ENVELOPE_DISCOUNT = 0.85;

/** Envelope long-distance pricing: sliding scale for routes over 500km */
export const ENVELOPE_DISTANCE_THRESHOLD_KM = 500;
export const ENVELOPE_MIN_LONG_DISTANCE_PRICE = 220.00;
export const ENVELOPE_MAX_LONG_DISTANCE_PRICE = 500.00;
/** Distance at which the envelope max price is reached */
export const ENVELOPE_MAX_DISTANCE_KM = 2000;

/** Weight band definition */
export interface WeightBand {
  id: string;
  label: string;
  range: [number, number];
  midpoint: number;
  icon: string;
  reference: string;
}

/** Weight bands for parcel service */
export const WEIGHT_BANDS: WeightBand[] = [
  { id: "envelope", label: "Envelope", range: [0, 1], midpoint: 0.5, icon: "Mail", reference: "Documents, medication, or a phone" },
  { id: "light", label: "Light", range: [1, 5], midpoint: 3, icon: "Feather", reference: "A few books or a pair of shoes" },
  { id: "medium", label: "Medium", range: [5, 15], midpoint: 10, icon: "Package", reference: "A microwave or a medium suitcase" },
  { id: "heavy", label: "Heavy", range: [15, 30], midpoint: 22.5, icon: "Dumbbell", reference: "A large dog food bag or small furniture" },
  { id: "extra-heavy", label: "Extra Heavy", range: [30, 50], midpoint: 40, icon: "Weight", reference: "A washing machine drum or heavy toolbox" },
];

/** Get a weight band by ID */
export const getWeightBand = (bandId: string): WeightBand | undefined =>
  WEIGHT_BANDS.find((b) => b.id === bandId);

/** Determine which band a given weight falls into */
export const getBandForWeight = (weightKg: number): WeightBand | undefined =>
  WEIGHT_BANDS.find((b) => weightKg >= b.range[0] && weightKg <= b.range[1]);

/**
 * Calculate delivery price using a weight band instead of exact weight.
 * Uses the band midpoint internally.
 */
export const calculateBandPrice = (
  originCity: string,
  destinationCity: string,
  bandId: string,
  distanceKm?: number,
  includeTracking: boolean = false
): PriceBreakdown | null => {
  const band = getWeightBand(bandId);
  if (!band) return null;

  const multiplier = BAND_MULTIPLIERS[bandId] ?? 1.0;
  const trackingFee = includeTracking ? TRACKING_FEE : 0;
  const effectiveDistance = distanceKm || DEFAULT_DISTANCE_KM;

  // --- Step 1: Compute the envelope base price for this route ---
  let envelopePrice: number;

  if (effectiveDistance > ENVELOPE_DISTANCE_THRESHOLD_KM) {
    // Sliding scale: R220 at 500km, linearly increasing to R500 at 2000km
    const distanceRatio = Math.min(1, (effectiveDistance - ENVELOPE_DISTANCE_THRESHOLD_KM) / (ENVELOPE_MAX_DISTANCE_KM - ENVELOPE_DISTANCE_THRESHOLD_KM));
    envelopePrice = ENVELOPE_MIN_LONG_DISTANCE_PRICE + distanceRatio * (ENVELOPE_MAX_LONG_DISTANCE_PRICE - ENVELOPE_MIN_LONG_DISTANCE_PRICE);
  } else {
    // Short/medium distance: use envelope minimum
    envelopePrice = ENVELOPE_MINIMUM_PRICE;
  }

  envelopePrice = Math.round(envelopePrice * 100) / 100;

  // --- Step 2: Apply band multiplier and long-distance discount ---
  let discountedPrice = envelopePrice * multiplier;
  if (effectiveDistance > LONG_DISTANCE_DISCOUNT_THRESHOLD_KM) {
    discountedPrice *= LONG_DISTANCE_DISCOUNT_FACTOR;
  }

  // Cross-border light parcel incentive: 15% off for light band over 900km
  const isCrossBorder = getDistanceCategory(originCity, destinationCity) !== "Domestic";
  if (bandId === "light" && effectiveDistance > 900 && isCrossBorder) {
    discountedPrice *= 0.85;
  }

  const finalPrice = Math.round(discountedPrice * 100) / 100 + trackingFee;

  // --- Step 3: Build result using the underlying calculation for metadata ---
  const result = calculateDeliveryPrice(originCity, destinationCity, band.midpoint, distanceKm, includeTracking);
  result.finalPrice = finalPrice;

  return result;
};

/**
 * Calculates the sliding percentage of bus fare based on parcel weight.
 * 
 * 1-5kg:  5% to 25% (linear scale)
 * 5-10kg: 25% to 40% (linear scale)
 * 10-50kg: 40% to 65% (linear scale)
 */
export const calculateWeightPercentage = (weightKg: number): number => {
  if (weightKg <= 1) return 5;
  
  if (weightKg <= 5) {
    // Base 5% at 1kg, sliding to 25% at 5kg
    const basePct = 5;
    const scale = (25 - 5) / (5 - 1); // 20% over 4kg range = 5% per kg
    return basePct + (weightKg - 1) * scale;
  } else if (weightKg <= 10) {
    // Base 25% at 5kg, sliding to 40% at 10kg
    const basePct = 25;
    const scale = (40 - 25) / (10 - 5); // 15% over 5kg range = 3% per kg
    return basePct + (weightKg - 5) * scale;
  } else {
    // Base 40% at 10kg, sliding to 65% at 50kg
    const basePct = 40;
    const scale = (65 - 40) / (50 - 10); // 25% over 40kg range = 0.625% per kg
    return Math.min(65, basePct + (weightKg - 10) * scale);
  }
};

/**
 * Gets the route price from the database.
 * Supports bidirectional lookup (A->B or B->A).
 */
export const getRoutePrice = (originCity: string, destinationCity: string): number | null => {
  const normalizedOrigin = normalizeCity(originCity);
  const normalizedDest = normalizeCity(destinationCity);
  
  const routeKey = `${normalizedOrigin}-${normalizedDest}`;
  const reverseKey = `${normalizedDest}-${normalizedOrigin}`;
  
  if (ROUTE_PRICING_DATABASE[routeKey]) {
    return ROUTE_PRICING_DATABASE[routeKey];
  }
  if (ROUTE_PRICING_DATABASE[reverseKey]) {
    return ROUTE_PRICING_DATABASE[reverseKey];
  }
  
  return null;
};

/**
 * Normalizes city names for lookup (capitalize first letter).
 */
const normalizeCity = (city: string): string => {
  const trimmed = city.trim().toLowerCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

/**
 * Classifies a route by distance category.
 */
export const getDistanceCategory = (origin: string, destination: string): string => {
  const longRoutes = ["harare", "bulawayo"];
  const medRoutes = ["maseru", "durban", "bloemfontein", "cape town"];
  
  const originLower = origin.toLowerCase();
  const destLower = destination.toLowerCase();
  
  if (longRoutes.some(city => originLower.includes(city) || destLower.includes(city))) {
    return "Long International";
  }
  if (medRoutes.some(city => originLower.includes(city) || destLower.includes(city))) {
    return "Medium Distance";
  }
  return "Domestic";
};

export interface PriceBreakdown {
  route: string;
  distanceCategory: string;
  routeBase: number;
  routeBaseSource: "database" | "estimated";
  parcelWeightKg: number;
  applicablePercentage: number;
  baseCalculatedPrice: number;
  afterMultiplier: number;
  minimumEnforced: boolean;
  priceAdjustmentApplied: boolean;
  trackingIncluded: boolean;
  trackingFee: number;
  finalPrice: number;
  currency: string;
}

/**
 * Calculates delivery price using the internal pricing system.
 * NOTE: Internal calculation details should NOT be exposed in the UI.
 * 
 * @param originCity - Origin city name
 * @param destinationCity - Destination city name
 * @param weightKg - Parcel weight in kilograms (1-50kg)
 * @param distanceKm - Optional distance in km for fallback calculation
 * @param includeTracking - Whether to include parcel tracking add-on
 * @returns Price breakdown object
 */
export const calculateDeliveryPrice = (
  originCity: string,
  destinationCity: string,
  weightKg: number,
  distanceKm?: number,
  includeTracking: boolean = false
): PriceBreakdown => {
  // Clamp weight to valid range
  const clampedWeight = Math.max(WEIGHT_LIMITS.min, Math.min(WEIGHT_LIMITS.max, weightKg));
  
  // 1. Find route base price
  let routeBase = getRoutePrice(originCity, destinationCity);
  let routeBaseSource: "database" | "estimated" = "database";
  
  if (routeBase === null) {
    // Fallback: use distance-based estimation
    const effectiveDistance = distanceKm || DEFAULT_DISTANCE_KM;
    routeBase = FALLBACK_FARE_PER_KM * effectiveDistance;
    routeBaseSource = "estimated";
  }
  
  // 2. Calculate applicable percentage and base price
  const applicablePercentage = calculateWeightPercentage(clampedWeight);
  const baseCalculatedPrice = (routeBase * (applicablePercentage / 100)) + HANDLING_FEE;
  
  // 3. Apply price multiplier
  const afterMultiplier = baseCalculatedPrice * PRICE_MULTIPLIER;
  
  // 4. Enforce minimum price
  let basePrice = Math.max(MINIMUM_PRICE, afterMultiplier);
  const minimumEnforced = basePrice === MINIMUM_PRICE;
  
  // 5. Apply distance-based pricing adjustment for routes over 200km
  const effectiveDistance = distanceKm || DEFAULT_DISTANCE_KM;
  const priceAdjustmentApplied = effectiveDistance > DISTANCE_ADJUSTMENT_THRESHOLD_KM;
  
  if (priceAdjustmentApplied) {
    basePrice = basePrice * DISTANCE_ADJUSTMENT_FACTOR;
    // Re-enforce minimum price after adjustment
    basePrice = Math.max(MINIMUM_PRICE, basePrice);
  }
  
  // 6. Add tracking fee if requested (not adjusted)
  const trackingFee = includeTracking ? TRACKING_FEE : 0;
  const finalPrice = basePrice + trackingFee;
  
  // 7. Prepare result breakdown (internal details)
  return {
    route: `${originCity} to ${destinationCity}`,
    distanceCategory: getDistanceCategory(originCity, destinationCity),
    routeBase: Math.round(routeBase * 100) / 100,
    routeBaseSource,
    parcelWeightKg: clampedWeight,
    applicablePercentage: Math.round(applicablePercentage * 10) / 10,
    baseCalculatedPrice: Math.round(baseCalculatedPrice * 100) / 100,
    afterMultiplier: Math.round(afterMultiplier * 100) / 100,
    minimumEnforced,
    priceAdjustmentApplied,
    trackingIncluded: includeTracking,
    trackingFee: trackingFee,
    finalPrice: Math.round(finalPrice * 100) / 100,
    currency: "ZAR",
  };
};

/**
 * Quick price lookup for a given route and weight.
 * Returns just the final price, or null if weight is invalid.
 */
export const getQuickPrice = (
  originCity: string,
  destinationCity: string,
  weightKg: number,
  distanceKm?: number,
  includeTracking: boolean = false
): number | null => {
  if (weightKg < WEIGHT_LIMITS.min || weightKg > WEIGHT_LIMITS.max) {
    return null;
  }
  const result = calculateDeliveryPrice(originCity, destinationCity, weightKg, distanceKm, includeTracking);
  return result.finalPrice;
};
