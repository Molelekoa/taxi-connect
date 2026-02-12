

## Fix: Consistent Pricing Between Estimator and Booking Page

### The Problem

Cape Town to Pretoria is not in the hardcoded route database, so the pricing engine falls back to distance-based calculation (`R1.50/km`).

- **FreightEstimator** uses Mapbox to get the real driving distance (~1,400 km), producing ~R750.
- **SmallParcelBooking** (direct entry) passes `undefined` for distance, so the engine defaults to 400 km, producing ~R235.

### The Fix

**1. Pass distance from estimator to booking page**

In `src/pages/FreightEstimator.tsx`, add `distance` to the navigation state when clicking "Book This Delivery":

```
state: {
  origin, destination, weight, price, includeTracking,
  distance: effectiveDistance   // <-- add this
}
```

**2. Use Mapbox distance in SmallParcelBooking when no prefilled price**

In `src/pages/SmallParcelBooking.tsx`:

- Accept `distance` from navigation state
- Import and call `useMapboxDistance` hook to calculate distance when the user enters origin/destination directly (no prefilled data)
- Pass the real distance to `calculateDeliveryPrice` on line 137 instead of `undefined`

**3. Store prefilled distance for tracking-toggle adjustments**

When the user came from the estimator with a prefilled price, store the distance so that if they toggle tracking (which doesn't invalidate the prefilled price), the price stays consistent. If they change origin/destination/weight, the prefilled price is already invalidated and the live Mapbox distance will be used instead.

### Technical Changes

| File | Change |
|------|--------|
| `src/pages/FreightEstimator.tsx` | Add `distance: effectiveDistance` to navigation state (1 line) |
| `src/pages/SmallParcelBooking.tsx` | Accept `distance` from prefilled state; import and use `useMapboxDistance` hook for live calculation; pass distance to `calculateDeliveryPrice` |

### Result

Both entry points will use real driving distance, producing the same price for the same route and weight.

