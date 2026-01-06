// ==========================================
// SMALL PARCEL SERVICE CONFIGURATION
// ==========================================

export const PARCEL_SERVICE = {
  eligibleOrigins: ['johannesburg', 'pretoria', 'jhb', 'pta', 'randburg', 'sandton', 'centurion', 'midrand', 'rosebank', 'fourways'],
  maxWeight: 5,
  pricing: {
    lesotho: [
      { minKg: 0, maxKg: 3, price: 150 },
      { minKg: 3, maxKg: 5, price: 800 },
    ],
    zimbabwe: [
      { minKg: 0, maxKg: 3, price: 525 },
      { minKg: 3, maxKg: 5, price: 2800 },
    ],
  },
} as const;

export type ParcelDestination = 'lesotho' | 'zimbabwe';

export const getParcelPrice = (destination: ParcelDestination, weight: number): number | null => {
  if (weight <= 0 || weight > PARCEL_SERVICE.maxWeight) return null;
  const tiers = PARCEL_SERVICE.pricing[destination];
  const tier = tiers.find(t => weight > t.minKg && weight <= t.maxKg) || tiers[0];
  return tier.price;
};

export const isEligibleOrigin = (location: string): boolean => {
  const lowerLocation = location.toLowerCase();
  return PARCEL_SERVICE.eligibleOrigins.some(origin => lowerLocation.includes(origin));
};
