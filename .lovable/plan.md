# Plan: Parcel Delivery Workflow Enhancements

## Analysis of What Already Exists vs What's Needed

**Already built:**

- Cancel flow via `cancel-accepted-match` edge function (resets parcel to pending, notifies sender, re-triggers matching)
- Delivery proof submission (photo + geotag) via `submit-delivery-proof`
- Admin verify/reject via `verify-delivery` edge function
- Audit log triggers on parcels, matches, traveler_profiles
- Suburb fields already exist in `SmallParcelBooking.tsx` form (pickupSuburb, deliverySuburb) but NOT stored as a column on parcels — they're concatenated into `pickup_address`/`delivery_address`

**What's missing:**

1. `suburb` column on parcels (currently embedded in address string)
2. `cancellations` table for logging cancellations with reason/traveler
3. `delivered_at` and `verified_at` timestamps on parcels
4. "Cancelled" status in parcels CHECK constraint + UI filters
5. Forced photo upload +geotag (currently either/or) for delivery proof
6. Forced Collection proof (photo+geotag when traveler picks up parcel)
7. Admin "Cancelled" filter tab
8. Enhanced audit log display (showing parcel ID, traveler ID, reason in readable format)
9. Verified deliveries showing delivered_date + verified_date columns

## Database Changes (Migration)

1. Add columns to `parcels`:
  - `suburb` (text, nullable)
  - `delivered_at` (timestamptz, nullable) — set when proof submitted
  - `verified_at` (timestamptz, nullable) — set when admin approves
  - `cancelled_at` (timestamptz, nullable)
2. Update parcels status CHECK constraint to include `cancelled`
3. Create `cancellations` table:
  - `id` (uuid, PK)
  - `parcel_id` (uuid, NOT NULL)
  - `traveler_id` (uuid, nullable)
  - `reason` (text, nullable)
  - `created_at` (timestamptz, default now())
  - RLS: admin SELECT only; inserts via service role (edge function)

## Edge Function Changes

### `cancel-accepted-match`

- Also insert into `cancellations` table with parcel_id, traveler profile_id, reason
- Set `cancelled_at = now()` on the parcel when cancelling

### `submit-delivery-proof`

- **Require both** photo AND geotag ( pop up message if either missing)
- Set `delivered_at = now()` on the parcel

### `verify-delivery`

- On approve: set `verified_at = now()` on the parcel (already sets status to `delivered_verified`)

### New: Collection proof

- Add a new edge function `submit-collection-proof` that:
  - Accepts `matchId`, `photoUrl`, `lat`, `lng`
  - Validates traveler owns the match
  - Updates parcel status to `collected` with photo and geotag stored
  - Notifies sender that parcel has been collected

## UI Changes

### SmallParcelBooking.tsx

- Store `suburb` as a separate column when inserting parcel (use `pickupSuburb` value)

### TravelerDashboard.tsx

- **Carrying tab**: Add "Collected" button that requires photo+geotag before moving to collected status
- **Delivery proof dialog**: Make both photo AND geotag mandatory (disable submit until both captured)
- **Cancel button**: Already exists — no change needed

### AdminDashboard.tsx

- Add `cancelled` to STATUSES array and statusConfig
- Add "Cancelled" filter option in Parcels tab
- In Verified Deliveries section: show `delivered_at` and `verified_at` dates
- Enhanced Audit Log: show Record ID (truncated), parse old/new values to show status transitions, traveler IDs, and reasons in human-readable format
- Show suburb in parcel details

### SenderDashboard.tsx

- Add `cancelled` status config entry
- Show suburb if available

## Files Modified

- **Database migration** — add columns, cancellations table, update CHECK
- `supabase/functions/cancel-accepted-match/index.ts` — insert cancellation record, set cancelled_at
- `supabase/functions/submit-delivery-proof/index.ts` — require both photo+geotag, set delivered_at
- `supabase/functions/verify-delivery/index.ts` — set verified_at on approve
- `supabase/functions/submit-collection-proof/index.ts` — **new** edge function for collection proof
- `supabase/config.toml` — register submit-collection-proof
- `src/pages/SmallParcelBooking.tsx` — store suburb column
- `src/pages/TravelerDashboard.tsx` — mandatory proof, collection proof UI
- `src/pages/AdminDashboard.tsx` — cancelled filter, enhanced audit, verified dates, suburb display
- `src/pages/SenderDashboard.tsx` — cancelled status config