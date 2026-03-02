

# Split Address Fields and Show Parcel Size to Travelers

## Overview
Two changes: (1) Replace the single pickup/delivery address text fields with structured address components (house number, street, suburb, plus optional additional info), and (2) show parcel weight band/size details on the Traveler Dashboard so travelers can make informed decisions before accepting.

## 1. Structured Address Fields on Booking Form

**File: `src/pages/SmallParcelBooking.tsx`**

### Schema Changes
Replace the single `pickupAddress` and `deliveryAddress` fields in both `parcelBookingSchema` and `verifiedSenderSchema` with:
- `pickupHouseNumber` -- mandatory, min 1 char ("House/Apt Number")
- `pickupStreet` -- mandatory, min 3 chars ("Street Name")
- `pickupSuburb` -- mandatory, min 2 chars ("Suburb")
- `pickupAdditionalInfo` -- optional ("Apartment/Complex name, gate code, etc.")
- `deliveryHouseNumber` -- mandatory, min 1 char
- `deliveryStreet` -- mandatory, min 3 chars
- `deliverySuburb` -- mandatory, min 2 chars
- `deliveryAdditionalInfo` -- optional

### Form State
Update `formData` initial state to replace `pickupAddress`/`deliveryAddress` with the six new fields (4 mandatory + 2 optional).

### Form UI
Replace the single "Pickup Address" input (lines 771-781) with a group of fields:
- House/Apartment Number (full width)
- Street Name (full width)
- Suburb (full width)
- Additional Info -- optional (full width, placeholder: "e.g., Sunset Complex, Gate 3")

Same for the delivery address section (lines 865-874).

### Data Submission
When inserting into the `parcels` table, concatenate the structured fields into the existing `pickup_address` and `delivery_address` columns:
```
pickup_address: `${pickupHouseNumber} ${pickupStreet}, ${pickupSuburb}${pickupAdditionalInfo ? ' (' + pickupAdditionalInfo + ')' : ''}`
```
This avoids any database migration -- the DB columns remain text.

### Review Section
Update the review cards (lines 1148, 1166) to display the full concatenated address.

### Prefill Handling
The `prefilled` state from the estimator currently passes `pickupAddress`/`deliveryAddress` strings. These will no longer pre-fill structured fields (they'll be empty), which is acceptable since the estimator only pre-fills city, weight, and price.

## 2. Show Parcel Size on Traveler Dashboard

**File: `src/pages/TravelerDashboard.tsx`**

### Data Already Available
The parcels query already fetches `weight_band` and `weight_kg`. The `weight_band` value (e.g., "envelope", "light", "medium", "heavy", "extra-heavy") maps to the `WEIGHT_BANDS` config.

### UI Changes
In three places (Browse Parcels, Matched, Accepted tabs), add a parcel size badge next to the existing weight display:

- **Browse Parcels** (line 344-345): After the weight kg span, add the weight band label and range. Example: "Medium (5-15kg)" displayed as a small badge.
- **Matched tab** (line 397-398): Same addition using `match.parcels?.weight_band`.
- **Accepted tab** (line 447): Same addition.

Import `WEIGHT_BANDS` from `@/config/pricingCalculator` and create a small helper to look up the band label:
```typescript
const getBandLabel = (bandId: string) => {
  const band = WEIGHT_BANDS.find(b => b.id === bandId);
  return band ? `${band.label} (${band.range[0]}-${band.range[1]}kg)` : null;
};
```

Replace the raw `weight_kg` display with the band label when available, falling back to kg display.

## Files Modified
- `src/pages/SmallParcelBooking.tsx` -- structured address fields, schema, form state, submission, review
- `src/pages/TravelerDashboard.tsx` -- parcel size display with weight band labels

## No Database Changes Required
Address fields are concatenated into existing `pickup_address` / `delivery_address` text columns.

