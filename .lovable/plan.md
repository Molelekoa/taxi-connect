

# 20% Price Reduction for Routes Over 800km

## Overview
Apply a hidden 20% discount on all deliveries where the route distance exceeds 800km. This incentivizes senders shipping multiple parcels on long-haul routes (Zimbabwe corridor) while keeping the discount invisible in the UI.

## Pricing Impact Summary

Only 3 route corridors are affected (all Zimbabwe routes):

| Route | Band | Current | New | Saving |
|---|---|---|---|---|
| JHB-Bulawayo (900km) | Envelope | R295 | R236 | R59 |
| | Light | R589 | R471 | R118 |
| | Medium | R737 | R589 | R148 |
| | Heavy | R884 | R707 | R177 |
| | Extra Heavy | R1,031 | R825 | R206 |
| JHB-Harare (1100km) | Envelope | R332 | R266 | R66 |
| | Light | R664 | R531 | R133 |
| | Medium | R830 | R664 | R166 |
| | Heavy | R996 | R797 | R199 |
| | Extra Heavy | R1,162 | R930 | R232 |
| Pretoria-Harare (1100km) | Same as JHB-Harare | | | |

All domestic SA and Lesotho routes remain unchanged.

## Technical Change

**Single file modified: `src/config/pricingCalculator.ts`**

1. Add two new internal constants:
   - `LONG_DISTANCE_DISCOUNT_THRESHOLD_KM = 800`
   - `LONG_DISTANCE_DISCOUNT_FACTOR = 0.80` (20% reduction)

2. In the `calculateBandPrice` function, after computing `finalPrice` (line 141), apply the discount if `effectiveDistance > 800`:
   ```
   let discountedPrice = envelopePrice * multiplier;
   if (effectiveDistance > LONG_DISTANCE_DISCOUNT_THRESHOLD_KM) {
     discountedPrice *= LONG_DISTANCE_DISCOUNT_FACTOR;
   }
   finalPrice = Math.round(discountedPrice * 100) / 100 + trackingFee;
   ```

3. No UI changes -- the discount is applied purely in the pricing engine. The `PriceBreakdown` object returned to the UI only contains the `finalPrice`, which already hides all internal logic.

No database changes, no new files, no edge function updates required.

