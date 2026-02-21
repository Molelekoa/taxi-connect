

# Weight Verification Strategy

## The Problem
Users self-declare parcel weight (1-20kg) with no validation. The sliding scale means a dishonest declaration of 3kg instead of 10kg could cut the price roughly in half. There is no way to weigh parcels digitally before collection.

## Recommended Solution: Weight Bands + Visual Guides + Collection Adjustment

Instead of asking for an exact weight (which invites gaming), switch to **weight bands** with visual reference examples. This reduces the incentive to lie (you can't shave off 0.5kg to save money) and makes it psychologically harder to pick the wrong band when shown relatable reference objects.

### What Changes

### 1. Replace free-text weight input with Weight Band selector

Replace the current number input with 4 clear weight bands:

| Band | Range | Visual Reference |
|------|-------|-----------------|
| Light | 1-5 kg | "A few books or a pair of shoes" |
| Medium | 5-10 kg | "A microwave or a small suitcase" |
| Heavy | 10-15 kg | "A large bag of dog food" |
| Extra Heavy | 15-20 kg | "A car tyre or a full toolbox" |

Each band is a clickable card with an icon and the reference description. The pricing engine uses the **midpoint** of each band (3kg, 7.5kg, 12.5kg, 17.5kg) for calculation.

### 2. Add a "Weight will be verified at collection" notice

A visible warning banner on both the estimator and booking pages:

> "Your parcel will be weighed at collection. If the actual weight falls in a different band, the price will be adjusted accordingly."

This creates accountability without requiring upfront verification technology.

### 3. Add weight verification fields to the Admin Dashboard

In the Parcels tab, add two new columns:
- **Declared Band** — what the sender selected
- **Verified Weight** — editable field the admin/traveler fills in at collection

When a verified weight is entered that falls in a different band, the admin sees a highlighted price discrepancy with the corrected price.

### 4. Update the pricing calculator

Add a new function `calculateBandPrice()` that takes a band name instead of exact weight, using the band midpoint internally. The existing `calculateDeliveryPrice()` remains unchanged for backward compatibility.

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/config/pricingCalculator.ts` | Modify | Add weight bands config and `calculateBandPrice()` helper |
| `src/components/WeightBandSelector.tsx` | Create | Reusable card-based weight band picker with visual references |
| `src/pages/FreightEstimator.tsx` | Modify | Replace weight number input with WeightBandSelector, add verification notice |
| `src/pages/SmallParcelBooking.tsx` | Modify | Replace weight number input with WeightBandSelector, add verification notice, pass band to submission |
| `src/pages/AdminDashboard.tsx` | Modify | Add declared band and verified weight columns to Parcels tab |

---

## Technical Details

**Weight bands constant** (added to `pricingCalculator.ts`):
```
WEIGHT_BANDS = [
  { id: "light", label: "Light", range: [1, 5], midpoint: 3, icon: "Feather", reference: "A few books or a pair of shoes" },
  { id: "medium", label: "Medium", range: [5, 10], midpoint: 7.5, icon: "Package", reference: "A microwave or a small suitcase" },
  { id: "heavy", label: "Heavy", range: [10, 15], midpoint: 12.5, icon: "Dumbbell", reference: "A large bag of dog food" },
  { id: "extra-heavy", label: "Extra Heavy", range: [15, 20], midpoint: 17.5, icon: "Anvil", reference: "A car tyre or a full toolbox" },
]
```

**WeightBandSelector component**: Renders 4 cards in a 2x2 grid (responsive). Each card shows the icon, band name, weight range, and everyday reference item. The selected band is highlighted with a primary border. On selection, it calls `onChange(bandId)`.

**Pricing integration**: `calculateBandPrice(origin, destination, bandId, distance?, tracking?)` looks up the band midpoint and delegates to existing `calculateDeliveryPrice()`. No internal pricing logic is exposed.

**Admin verification**: The verified weight field in the admin dashboard is a simple number input. When filled, the system recalculates price using the verified weight and shows the difference if the band changed (e.g., "Declared: Light (1-5kg) / Verified: 8kg (Medium) / Price difference: +R45").

**Database**: No schema changes needed immediately. The `parcels.weight_kg` column stores the band midpoint at booking time. When an admin verifies, they update `weight_kg` to the actual weight via the existing admin UPDATE RLS policy.
