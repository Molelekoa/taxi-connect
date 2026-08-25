// ============================================================
// SERVER-SIDE PRICING ENGINE (Deno / Edge Functions)
// Keep in sync with src/config/pricingCalculator.ts —
// this module must produce IDENTICAL results to
// calculateBandPrice() on the frontend. If you change pricing
// rules, update BOTH files and deploy the affected functions.
// Only the weight-band calculation is mirrored here because it
// is the only path used for parcel payments.
// ============================================================

export const TRACKING_FEE = 100.0;

export const BAND_MULTIPLIERS: Record<string, number> = {
  envelope: 1.0,
  light: 2.0,
  medium: 2.5,
  heavy: 3.0,
  "extra-heavy": 3.5,
};

export const VALID_BAND_IDS = Object.keys(BAND_MULTIPLIERS);

export const ENVELOPE_MINIMUM_PRICE = 175.0;
export const ENVELOPE_DISTANCE_THRESHOLD_KM = 500;
export const ENVELOPE_MIN_LONG_DISTANCE_PRICE = 220.0;
export const ENVELOPE_MAX_LONG_DISTANCE_PRICE = 500.0;
export const ENVELOPE_MAX_DISTANCE_KM = 2000;

export const LONG_DISTANCE_DISCOUNT_THRESHOLD_KM = 800;
export const LONG_DISTANCE_DISCOUNT_FACTOR = 0.8;

export const DEFAULT_DISTANCE_KM = 400;

/** Sanity clamp for stored distances (km) */
export const MIN_TRUSTED_DISTANCE_KM = 0;
export const MAX_TRUSTED_DISTANCE_KM = 3000;

const normalizeCity = (city: string): string => {
  const trimmed = city.trim().toLowerCase();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export const getDistanceCategory = (origin: string, destination: string): string => {
  const longRoutes = ["harare", "bulawayo"];
  const medRoutes = ["maseru", "durban", "bloemfontein", "cape town"];

  const originLower = origin.toLowerCase();
  const destLower = destination.toLowerCase();

  if (longRoutes.some((city) => originLower.includes(city) || destLower.includes(city))) {
    return "Long International";
  }
  if (medRoutes.some((city) => originLower.includes(city) || destLower.includes(city))) {
    return "Medium Distance";
  }
  return "Domestic";
};

/**
 * Mirrors calculateBandPrice() from src/config/pricingCalculator.ts.
 * Returns the final price in ZAR, or null if the band is invalid.
 */
export const calculateBandPriceServer = (
  originCity: string,
  destinationCity: string,
  bandId: string,
  distanceKm?: number,
  includeTracking: boolean = false
): number | null => {
  const multiplier = BAND_MULTIPLIERS[bandId];
  if (multiplier === undefined) return null;

  const trackingFee = includeTracking ? TRACKING_FEE : 0;
  const effectiveDistance = distanceKm || DEFAULT_DISTANCE_KM;

  // --- Step 1: Compute the envelope base price for this route ---
  let envelopePrice: number;

  if (effectiveDistance > ENVELOPE_DISTANCE_THRESHOLD_KM) {
    const distanceRatio = Math.min(
      1,
      (effectiveDistance - ENVELOPE_DISTANCE_THRESHOLD_KM) /
        (ENVELOPE_MAX_DISTANCE_KM - ENVELOPE_DISTANCE_THRESHOLD_KM)
    );
    envelopePrice =
      ENVELOPE_MIN_LONG_DISTANCE_PRICE +
      distanceRatio * (ENVELOPE_MAX_LONG_DISTANCE_PRICE - ENVELOPE_MIN_LONG_DISTANCE_PRICE);
  } else {
    envelopePrice = ENVELOPE_MINIMUM_PRICE;
  }

  envelopePrice = Math.round(envelopePrice * 100) / 100;

  // --- Step 2: Apply band multiplier and long-distance discount ---
  let discountedPrice = envelopePrice * multiplier;
  if (effectiveDistance > LONG_DISTANCE_DISCOUNT_THRESHOLD_KM) {
    discountedPrice *= LONG_DISTANCE_DISCOUNT_FACTOR;
  }

  const isCrossBorder = getDistanceCategory(originCity, destinationCity) !== "Domestic";
  if (bandId === "light" && effectiveDistance > 900 && isCrossBorder) {
    discountedPrice *= 0.85;
  }

  return Math.round(discountedPrice * 100) / 100 + trackingFee;
};
