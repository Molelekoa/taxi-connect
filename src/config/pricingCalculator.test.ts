import { describe, it, expect } from "vitest";
import {
  calculateDeliveryPrice,
  calculateBandPrice,
  calculateWeightPercentage,
  getRoutePrice,
  getDistanceCategory,
  getWeightBand,
  getBandForWeight,
  getQuickPrice,
  WEIGHT_BANDS,
  MINIMUM_PRICE,
  TRACKING_FEE,
  ENVELOPE_MINIMUM_PRICE,
} from "./pricingCalculator";

// ─── Route Pricing ──────────────────────────────────────────────────────────

describe("getRoutePrice", () => {
  it("returns known route price", () => {
    expect(getRoutePrice("Johannesburg", "Harare")).toBe(1200);
  });

  it("supports bidirectional lookup", () => {
    expect(getRoutePrice("Harare", "Johannesburg")).toBe(1200);
  });

  it("is case-insensitive", () => {
    expect(getRoutePrice("johannesburg", "HARARE")).toBe(1200);
  });

  it("returns null for unknown routes", () => {
    expect(getRoutePrice("FakeCity", "NowhereTown")).toBeNull();
  });
});

// ─── Distance Category ──────────────────────────────────────────────────────

describe("getDistanceCategory", () => {
  it("classifies Zimbabwe routes as Long International", () => {
    expect(getDistanceCategory("Johannesburg", "Harare")).toBe("Long International");
  });

  it("classifies Lesotho routes as Medium Distance", () => {
    expect(getDistanceCategory("Johannesburg", "Maseru")).toBe("Medium Distance");
  });

  it("classifies JHB-PTA as Domestic", () => {
    expect(getDistanceCategory("Johannesburg", "Pretoria")).toBe("Domestic");
  });
});

// ─── Weight Percentage ──────────────────────────────────────────────────────

describe("calculateWeightPercentage", () => {
  it("returns 5% for 1kg or less", () => {
    expect(calculateWeightPercentage(0.5)).toBe(5);
    expect(calculateWeightPercentage(1)).toBe(5);
  });

  it("scales linearly 5→25% for 1-5kg", () => {
    expect(calculateWeightPercentage(3)).toBe(15); // 5 + (3-1)*5 = 15
    expect(calculateWeightPercentage(5)).toBe(25);
  });

  it("scales linearly 25→40% for 5-10kg", () => {
    expect(calculateWeightPercentage(10)).toBe(40);
  });

  it("caps at 65% for heavy parcels", () => {
    expect(calculateWeightPercentage(50)).toBe(65);
    expect(calculateWeightPercentage(100)).toBe(65); // beyond max
  });
});

// ─── Weight Bands ───────────────────────────────────────────────────────────

describe("getWeightBand", () => {
  it("returns correct band by ID", () => {
    const band = getWeightBand("envelope");
    expect(band).toBeDefined();
    expect(band!.range).toEqual([0, 1]);
  });

  it("returns undefined for unknown band", () => {
    expect(getWeightBand("nonexistent")).toBeUndefined();
  });
});

describe("getBandForWeight", () => {
  it("maps 0.5kg to envelope", () => {
    expect(getBandForWeight(0.5)?.id).toBe("envelope");
  });

  it("maps 3kg to light", () => {
    expect(getBandForWeight(3)?.id).toBe("light");
  });

  it("maps 10kg to medium", () => {
    expect(getBandForWeight(10)?.id).toBe("medium");
  });

  it("maps 20kg to heavy", () => {
    expect(getBandForWeight(20)?.id).toBe("heavy");
  });

  it("maps 40kg to extra-heavy", () => {
    expect(getBandForWeight(40)?.id).toBe("extra-heavy");
  });

  it("returns undefined for out-of-range weight", () => {
    expect(getBandForWeight(100)).toBeUndefined();
  });
});

// ─── Full Price Calculation ──────────────────────────────────────────────────

describe("calculateDeliveryPrice", () => {
  it("returns a valid PriceBreakdown object", () => {
    const result = calculateDeliveryPrice("Johannesburg", "Pretoria", 5);
    expect(result).toHaveProperty("finalPrice");
    expect(result).toHaveProperty("currency", "ZAR");
    expect(result).toHaveProperty("route", "Johannesburg to Pretoria");
    expect(result.finalPrice).toBeGreaterThan(0);
  });

  it("enforces minimum price for very light parcels on short routes", () => {
    const result = calculateDeliveryPrice("Johannesburg", "Pretoria", 1);
    expect(result.finalPrice).toBeGreaterThanOrEqual(MINIMUM_PRICE);
  });

  it("adds tracking fee when requested", () => {
    const without = calculateDeliveryPrice("Johannesburg", "Durban", 5, undefined, false);
    const withTracking = calculateDeliveryPrice("Johannesburg", "Durban", 5, undefined, true);
    expect(withTracking.finalPrice - without.finalPrice).toBeCloseTo(TRACKING_FEE, 0);
    expect(withTracking.trackingIncluded).toBe(true);
  });

  it("uses fallback fare for unknown routes", () => {
    const result = calculateDeliveryPrice("FakeCity", "NowhereTown", 10, 300);
    expect(result.routeBaseSource).toBe("estimated");
    expect(result.finalPrice).toBeGreaterThan(0);
  });

  it("clamps weight to valid range", () => {
    const result = calculateDeliveryPrice("Johannesburg", "Pretoria", 100);
    expect(result.parcelWeightKg).toBe(50); // clamped to max
  });
});

// ─── Band Price Calculation ─────────────────────────────────────────────────

describe("calculateBandPrice", () => {
  it("returns a price for valid band", () => {
    const result = calculateBandPrice("Johannesburg", "Pretoria", "light", 60);
    expect(result).not.toBeNull();
    expect(result!.finalPrice).toBeGreaterThan(0);
  });

  it("returns null for invalid band", () => {
    expect(calculateBandPrice("Johannesburg", "Pretoria", "nonexistent")).toBeNull();
  });

  it("envelope is cheaper than heavier bands", () => {
    const envelope = calculateBandPrice("Johannesburg", "Durban", "envelope", 500);
    const heavy = calculateBandPrice("Johannesburg", "Durban", "heavy", 500);
    expect(envelope!.finalPrice).toBeLessThan(heavy!.finalPrice);
  });

  it("includes tracking fee when requested", () => {
    const without = calculateBandPrice("Johannesburg", "Durban", "light", 500, false);
    const withTracking = calculateBandPrice("Johannesburg", "Durban", "light", 500, true);
    expect(withTracking!.finalPrice - without!.finalPrice).toBeCloseTo(TRACKING_FEE, 0);
  });
});

// ─── Quick Price ────────────────────────────────────────────────────────────

describe("getQuickPrice", () => {
  it("returns a number for valid inputs", () => {
    const price = getQuickPrice("Johannesburg", "Pretoria", 5);
    expect(price).toBeGreaterThan(0);
  });

  it("returns null for out-of-range weight", () => {
    expect(getQuickPrice("Johannesburg", "Pretoria", -1)).toBeNull();
    expect(getQuickPrice("Johannesburg", "Pretoria", 51)).toBeNull();
  });
});

// ─── Edge Cases ─────────────────────────────────────────────────────────────

describe("edge cases", () => {
  it("all weight bands have non-overlapping ranges", () => {
    for (let i = 1; i < WEIGHT_BANDS.length; i++) {
      expect(WEIGHT_BANDS[i].range[0]).toBe(WEIGHT_BANDS[i - 1].range[1]);
    }
  });

  it("all weight bands have positive midpoints", () => {
    WEIGHT_BANDS.forEach((b) => {
      expect(b.midpoint).toBeGreaterThan(0);
    });
  });

  it("price increases with weight for same route", () => {
    const prices = [1, 5, 15, 30, 50].map(
      (w) => calculateDeliveryPrice("Johannesburg", "Harare", w).finalPrice
    );
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });
});
