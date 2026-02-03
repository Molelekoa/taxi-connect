

## Pricing Adjustment for Routes Over 200km

### Overview
Implement a 35% pricing adjustment for all parcel deliveries traveling more than 200km. This adjustment is applied internally within the pricing engine and will not be visible or referenced in any user-facing interface.

---

### What Will Change

The pricing engine will automatically reduce prices by 35% when the calculated or estimated distance exceeds 200km. Users will simply see lower prices on long-distance routes without any indication of a "discount" or special pricing.

---

### Technical Changes

**File: `src/config/pricingCalculator.ts`**

| Change | Description |
|--------|-------------|
| Add `DISTANCE_ADJUSTMENT_THRESHOLD_KM` constant | Set to `200` - the distance above which pricing adjustment applies |
| Add `DISTANCE_ADJUSTMENT_FACTOR` constant | Set to `0.65` (65% of original = 35% reduction) |
| Update `calculateDeliveryPrice` function | Apply the adjustment factor when distance exceeds threshold |
| Update `PriceBreakdown` interface | Add internal tracking field `adjustedPrice` (not exposed to UI) |

---

### Updated Calculation Flow

```text
Route Base Price
      |
      v
Apply Weight Percentage (5-65%)
      |
      v
Add Handling Fee (R25)
      |
      v
Apply 2.5x Multiplier
      |
      v
Enforce Minimum Price (R135)
      |
      v
[If distance > 200km] --> Multiply by 0.65 (35% reduction)
      |
      v
Re-enforce Minimum Price (R135)
      |
      v
Add Tracking Fee (R100 if selected)
      |
      v
FINAL PRICE
```

---

### Implementation Details

1. **New Constants** (internal, not exposed):
   - `DISTANCE_ADJUSTMENT_THRESHOLD_KM = 200`
   - `DISTANCE_ADJUSTMENT_FACTOR = 0.65`

2. **Logic Update** in `calculateDeliveryPrice`:
   - After enforcing minimum price, check if `distanceKm > 200`
   - If true, multiply the base price by `0.65`
   - Re-enforce minimum price of R135 after adjustment
   - Add tracking fee last (tracking fee is NOT adjusted)

3. **Interface Update** (internal only):
   - Add `priceAdjustmentApplied: boolean` to `PriceBreakdown` for internal debugging
   - This field is purely for internal use and will not be exposed in UI components

---

### UI Impact

**None** - The user interface will continue to display only the final calculated price. No references to "discount", "adjustment", or "long distance" will appear. The existing memory constraints about hiding internal pricing logic remain fully respected.

---

### Price Examples After Implementation

**Short Routes (under 200km) - No change:**
- Johannesburg to Pretoria: R135 - R562.50 (1kg - 20kg)

**Long Routes (over 200km) - 35% lower:**
- Johannesburg to Durban: R135 - R568.75 (was R875.00 for 20kg)
- Johannesburg to Harare: R138.13 - R1,308.13 (was R2,012.50 for 20kg)
- Johannesburg to Maseru: R135 - R304.69 (was R468.75 for 20kg)

