

# Add "Envelope" Weight Band for Documents and Small Items

## What Changes

### 1. New weight band: "Envelope" (0 - 1 kg)

A new lowest-tier band will be added for documents, medication, and very small parcels:

| Band | Range | Midpoint | Visual Reference |
|------|-------|----------|-----------------|
| **Envelope** | **0 - 1 kg** | **0.5 kg** | **"Documents, medication, or a phone"** |
| Light | 1 - 5 kg | 3 kg | "A few books or a pair of shoes" |
| Medium | 5 - 10 kg | 7.5 kg | ... |
| Heavy | 10 - 15 kg | 12.5 kg | ... |
| Extra Heavy | 15 - 20 kg | 17.5 kg | ... |

Icon: `Mail` from lucide-react (envelope icon, fits the category perfectly).

### 2. Pricing: 15% cheaper than Light

The `calculateBandPrice()` function will apply a 15% discount when the selected band is "envelope". Internally, it calculates the price as if it were at the envelope midpoint (0.5 kg), and then multiplies by 0.85. Since 0.5 kg falls below the current minimum weight of 1 kg, the weight minimum will be lowered to allow sub-1kg weights.

### 3. Update WeightBandSelector layout

With 5 bands, the grid changes to show the Envelope band prominently at the top (full width), then the remaining 4 in a 2x2 grid below.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/config/pricingCalculator.ts` | Add "envelope" band to `WEIGHT_BANDS`, lower `WEIGHT_LIMITS.min` to 0, add 15% discount constant, apply discount in `calculateBandPrice()` |
| `src/components/WeightBandSelector.tsx` | Add `Mail` icon to icon map, adjust grid so first item spans full width |
| `src/pages/FreightEstimator.tsx` | No changes needed (already uses WeightBandSelector and calculateBandPrice) |
| `src/pages/SmallParcelBooking.tsx` | No changes needed (already uses WeightBandSelector and calculateBandPrice) |

---

## Technical Details

**New constant:**
```
ENVELOPE_DISCOUNT = 0.85  // 15% cheaper than standard calculation
```

**Updated WEIGHT_BANDS** (envelope inserted at position 0):
```
{ id: "envelope", label: "Envelope", range: [0, 1], midpoint: 0.5, icon: "Mail", reference: "Documents, medication, or a phone" }
```

**Discount logic in `calculateBandPrice()`**: After computing the price via `calculateDeliveryPrice()`, if the band is "envelope", the `finalPrice` is multiplied by 0.85 (with the minimum price floor still enforced).

**Weight limits**: `WEIGHT_LIMITS.min` changes from 1 to 0 so the 0.5 kg midpoint is not clamped upward.

**`getBandForWeight()`**: Will correctly match weights 0-1 kg to the envelope band, and the existing Light band range stays at 1-5 kg.

