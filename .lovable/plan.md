

# Enhanced Admin Booking Management

## Current Gaps

1. **Bookings aren't saved to the database** -- the booking form currently does `console.log()` instead of inserting into the `parcels` table.
2. **The parcels table is missing key columns** -- no fields for recipient name/phone, pickup address, delivery address, weight band ID, tracking option, or sender contact details.
3. **The admin Parcels tab is bare** -- no detail view, no income summary, no filtering by status/route, no booking detail sheet.

## What Changes

### 1. Extend the `parcels` table (database migration)

Add these columns to capture the full booking:

| Column | Type | Purpose |
|--------|------|---------|
| `recipient_name` | text | Who receives the parcel |
| `recipient_phone` | text | Recipient contact number |
| `pickup_address` | text | Street-level pickup address |
| `delivery_address` | text | Street-level delivery address |
| `weight_band` | text | Band ID (envelope, light, medium, heavy, extra-heavy) |
| `include_tracking` | boolean | Whether tracking was purchased |
| `sender_name` | text | Sender's name at time of booking |
| `sender_email` | text | Sender's email at time of booking |
| `sender_phone` | text | Sender's phone at time of booking |

The existing `pickup_location` and `dropoff_location` columns will store the city names (origin/destination), while the new `pickup_address` and `delivery_address` store the specific addresses.

### 2. Save bookings to the database (SmallParcelBooking.tsx)

Replace the simulated `console.log` with an actual Supabase insert:

- Fetch the user's profile ID using `get_profile_id`
- Insert a row into `parcels` with all form data, price, weight band, tracking, and sender details
- Upload ID document to storage if the user is not a verified sender
- Show success/error feedback

### 3. Redesign the admin Parcels tab and Overview

**Overview tab enhancements:**
- Add total income card (sum of all parcel prices)
- Add income by status breakdown (pending vs delivered revenue)
- Add parcels by weight band breakdown
- Add top routes summary

**Parcels tab enhancements:**
- Add status filter dropdown (All / Pending / Collected / In Transit / Delivered)
- Add search by sender name, recipient name, or location
- Show more columns: sender name, sender phone, recipient name, recipient phone, weight band label, tracking status, price
- Add a "View Details" button on each row that opens a side sheet with full booking details
- Keep the existing status update dropdown and verified weight functionality

**Parcel Detail Sheet (new component within AdminDashboard):**
- Sender section: name, email, phone
- Route section: origin city, pickup address, destination city, delivery address
- Parcel section: weight band, declared weight, verified weight, tracking, description
- Financials: price, tracking fee
- Status timeline: current status with change dropdown
- Created date

## Files to Modify

| File | Change |
|------|--------|
| Database migration | Add 9 new columns to `parcels` table |
| `src/pages/SmallParcelBooking.tsx` | Replace simulated submit with real Supabase insert; upload ID doc to storage |
| `src/pages/AdminDashboard.tsx` | Add income/route/band stats to Overview; add filters + search + detail sheet to Parcels tab; update Parcel type to include new fields |
| `src/integrations/supabase/types.ts` | Will auto-update after migration |

## Technical Details

**Booking insert (SmallParcelBooking.tsx):**
```
const { data: profileId } = await supabase.rpc('get_profile_id', { _auth_uid: user.id });

await supabase.from('parcels').insert({
  sender_id: profileId,
  pickup_location: formData.originCity,
  dropoff_location: formData.destinationCity,
  pickup_address: formData.pickupAddress,
  delivery_address: formData.deliveryAddress,
  recipient_name: formData.recipientName,
  recipient_phone: formData.recipientPhone,
  weight_band: formData.weightBand,
  weight_kg: selectedBand.midpoint,
  price: displayPrice,
  include_tracking: formData.includeTracking,
  description: formData.description,
  sender_name: formData.contactName,
  sender_email: formData.email,
  sender_phone: formData.phone,
  status: 'pending',
});
```

**Admin Overview income calculation:**
```
const totalIncome = parcels.reduce((sum, p) => sum + (p.price || 0), 0);
const deliveredIncome = parcels
  .filter(p => p.status === 'delivered')
  .reduce((sum, p) => sum + (p.price || 0), 0);
```

**Admin Parcels tab filtering:**
- Status filter: dropdown with "All" + each status
- Search: text input filtering across sender_name, recipient_name, pickup_location, dropoff_location
- Both applied together with `useMemo`

**Parcel Detail Sheet:** Reuses the existing `Sheet` component pattern from `TravelerSheet`, showing all booking fields in organized sections (Sender, Route, Parcel, Status).

