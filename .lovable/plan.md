

# Fix Pricing: Envelope Minimum R175 + Light at 2x Envelope

## The Problem

The current R135 minimum price floor combined with the 0.65 distance adjustment flattens all prices for shorter/medium routes. Envelope and Light end up at nearly the same price because both get pushed down to the floor. There is no incentive for travelers to carry heavier parcels.

## The Fix

Two changes to the pricing engine:

### 1. Raise envelope minimum to R175

The `MINIMUM_PRICE` stays at R135 as a system-wide floor, but a new `ENVELOPE_MINIMUM_PRICE = 175` constant is introduced specifically for the envelope band. The envelope sliding scale for routes over 500km stays as-is (R220 to R500).

### 2. Compute all non-envelope bands as multiples of the envelope price

Instead of relying on the natural calculation (which gets flattened), each band's price is derived from the envelope price for the same route:

| Band | Multiplier | Rationale |
|------|-----------|-----------|
| Envelope | 1x | Base price |
| Light | 2.0x | 100% increase as requested |
| Medium | 2.5x | Progressive increase |
| Heavy | 3.0x | Progressive increase |
| Extra Heavy | 3.5x | Progressive increase |

### Example pricing across all routes

**Short/Medium routes (under 500km) -- Envelope = R175 minimum:**

| Route | ~Distance | Envelope | Light | Medium | Heavy | Extra Heavy |
|-------|-----------|----------|-------|--------|-------|-------------|
| JHB - Pretoria | 60 km | R175 | R350 | R438 | R525 | R613 |
| Bloemfontein - Maseru | 170 km | R175 | R350 | R438 | R525 | R613 |
| JHB - Maseru | 400 km | R175 | R350 | R438 | R525 | R613 |
| JHB - Bloemfontein | 400 km | R175 | R350 | R438 | R525 | R613 |

**Long routes (over 500km) -- Envelope sliding scale kicks in:**

| Route | ~Distance | Envelope | Light | Medium | Heavy | Extra Heavy |
|-------|-----------|----------|-------|--------|-------|-------------|
| Durban - Maseru | 500 km | R220 | R440 | R550 | R660 | R770 |
| JHB - Durban | 570 km | R233 | R466 | R583 | R699 | R816 |
| JHB - Bulawayo | 900 km | R295 | R590 | R738 | R885 | R1,033 |
| JHB - Harare | 1,100 km | R332 | R664 | R830 | R996 | R1,162 |
| Pretoria - Harare | 1,200 km | R351 | R702 | R878 | R1,053 | R1,229 |
| Pretoria - Durban | 600 km | R239 | R478 | R598 | R717 | R836 |

Key outcomes:
- Envelope is always the cheapest option
- Light is always exactly 2x envelope (100% more)
- Each heavier band costs progressively more
- Distance clearly affects price for routes over 500km
- Shorter routes all share the R175 envelope floor (so Light = R350 minimum)

## File to Modify

**`src/config/pricingCalculator.ts`** -- all changes are in this single file:

- Add `ENVELOPE_MINIMUM_PRICE = 175` constant
- Add `BAND_MULTIPLIERS` object mapping band IDs to multipliers
- Rewrite `calculateBandPrice()` to:
  1. First compute the envelope price for the given route (using existing envelope logic with new R175 minimum)
  2. If band is "envelope", return that price
  3. For any other band, multiply the envelope price by the band's multiplier
- The existing `calculateDeliveryPrice()` and `calculateWeightPercentage()` functions remain unchanged (they still work for any direct weight-based calculations)

