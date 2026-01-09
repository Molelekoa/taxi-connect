// ==========================================
// COURIERCONNECT SLIDING-SCALE PRICING
// ==========================================

/**
 * Bus fare database for common routes (in ZAR).
 * Keys are route tuples [origin, destination] - bidirectional lookup supported.
 */
export const BUS_FARE_DATABASE: Record<string, number> = {
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

/** Fallback fare per km when route not in database */
export const FALLBACK_FARE_PER_KM = 1.50;

/** Default estimated distance for unknown routes (km) */
export const DEFAULT_DISTANCE_KM = 400;

/** Weight limits for parcel service */
export const WEIGHT_LIMITS = {
  min: 1,
  max: 20,
} as const;

/**
 * Calculates the sliding percentage of bus fare based on parcel weight.
 * 
 * 1-5kg:  5% to 25% (linear scale)
 * 5-10kg: 25% to 40% (linear scale)
 * 10-20kg: 40% to 65% (linear scale)
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
    // Base 40% at 10kg, sliding to 65% at 20kg
    const basePct = 40;
    const scale = (65 - 40) / (20 - 10); // 25% over 10kg range = 2.5% per kg
    return Math.min(65, basePct + (weightKg - 10) * scale);
  }
};

/**
 * Gets the bus fare for a route from the database.
 * Supports bidirectional lookup (A->B or B->A).
 */
export const getBusFare = (originCity: string, destinationCity: string): number | null => {
  const normalizedOrigin = normalizeCity(originCity);
  const normalizedDest = normalizeCity(destinationCity);
  
  const routeKey = `${normalizedOrigin}-${normalizedDest}`;
  const reverseKey = `${normalizedDest}-${normalizedOrigin}`;
  
  if (BUS_FARE_DATABASE[routeKey]) {
    return BUS_FARE_DATABASE[routeKey];
  }
  if (BUS_FARE_DATABASE[reverseKey]) {
    return BUS_FARE_DATABASE[reverseKey];
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
  busFare: number;
  busFareSource: "database" | "estimated";
  parcelWeightKg: number;
  applicablePercentage: number;
  baseCalculatedPrice: number;
  afterMultiplier: number;
  minimumEnforced: boolean;
  finalPrice: number;
  currency: string;
}

/**
 * Calculates delivery price using the sliding scale percentage system.
 * 
 * @param originCity - Origin city name
 * @param destinationCity - Destination city name
 * @param weightKg - Parcel weight in kilograms (1-20kg)
 * @param distanceKm - Optional distance in km for fallback calculation
 * @returns Price breakdown object
 */
export const calculateDeliveryPrice = (
  originCity: string,
  destinationCity: string,
  weightKg: number,
  distanceKm?: number
): PriceBreakdown => {
  // Clamp weight to valid range
  const clampedWeight = Math.max(WEIGHT_LIMITS.min, Math.min(WEIGHT_LIMITS.max, weightKg));
  
  // 1. Find bus fare
  let busFare = getBusFare(originCity, destinationCity);
  let busFareSource: "database" | "estimated" = "database";
  
  if (busFare === null) {
    // Fallback: use distance-based estimation
    const effectiveDistance = distanceKm || DEFAULT_DISTANCE_KM;
    busFare = FALLBACK_FARE_PER_KM * effectiveDistance;
    busFareSource = "estimated";
  }
  
  // 2. Calculate applicable percentage and base price
  const applicablePercentage = calculateWeightPercentage(clampedWeight);
  const baseCalculatedPrice = (busFare * (applicablePercentage / 100)) + HANDLING_FEE;
  
  // 3. Apply 150% increase (multiply by 2.5)
  const afterMultiplier = baseCalculatedPrice * PRICE_MULTIPLIER;
  
  // 4. Enforce minimum price
  const finalPrice = Math.max(MINIMUM_PRICE, afterMultiplier);
  const minimumEnforced = finalPrice === MINIMUM_PRICE;
  
  // 5. Prepare result breakdown
  return {
    route: `${originCity} to ${destinationCity}`,
    distanceCategory: getDistanceCategory(originCity, destinationCity),
    busFare: Math.round(busFare * 100) / 100,
    busFareSource,
    parcelWeightKg: clampedWeight,
    applicablePercentage: Math.round(applicablePercentage * 10) / 10,
    baseCalculatedPrice: Math.round(baseCalculatedPrice * 100) / 100,
    afterMultiplier: Math.round(afterMultiplier * 100) / 100,
    minimumEnforced,
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
  distanceKm?: number
): number | null => {
  if (weightKg < WEIGHT_LIMITS.min || weightKg > WEIGHT_LIMITS.max) {
    return null;
  }
  const result = calculateDeliveryPrice(originCity, destinationCity, weightKg, distanceKm);
  return result.finalPrice;
};
