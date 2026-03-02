

# Sender Dashboard Retry, Standardized Cities, Date Pickers, and Smart Reassignment

## Overview
This plan addresses five interconnected improvements: adding a retry-matching button for senders, standardizing city inputs across all forms, making pickup date windows mandatory with calendar pickers, limiting matched traveler info to name and phone only, and implementing earlier-traveler reassignment notifications.

## Changes

### 1. Shared City Constants
Create a single source of truth for city names used across the entire app.

**New file: `src/config/cities.ts`**
- Export a `CITIES` array: `["Johannesburg", "Pretoria", "Durban", "Cape Town", "Bloemfontein", "Maseru", "Harare", "Bulawayo"]`
- Export a `CITY_OPTIONS` array with `{ value, label }` format (e.g., `{ value: "Maseru", label: "Maseru (Lesotho)" }`)
- All forms will import from this single file

**Files updated to use shared constants:**
- `src/pages/SmallParcelBooking.tsx` -- replace `ORIGIN_CITIES` and `DESTINATION_CITIES` with `CITY_OPTIONS`
- `src/components/PostTrip.tsx` -- replace local `CITIES` array with import
- `src/pages/FreightEstimator.tsx` -- replace `POPULAR_CITIES` with `CITY_OPTIONS`
- `src/components/CarrierRegistrationForm/Step4Operations.tsx` (if it has city inputs)

### 2. Mandatory Pickup Date Window with Calendar Pickers
In `src/pages/SmallParcelBooking.tsx`:

- **Remove** the "Preferred Pickup Date" field entirely (it's redundant with earliest/latest)
- **Make `pickupEarliest` and `pickupLatest` required** in both zod schemas
- Change labels to "Earliest Pickup Date *" and "Latest Pickup Date *"
- **Replace `<Input type="date">`** with Popover + Calendar component pickers (same pattern used in `Step2Locations.tsx`)
- Remove the `pickupDate` field from form state

In `src/components/PostTrip.tsx`:
- Replace the `<Input type="date">` for travel date with a Popover + Calendar picker

### 3. Retry Button on Sender Dashboard
In `src/pages/SenderDashboard.tsx`:

- Add a "Retry Matching" button on each parcel card where `status === 'pending'`
- On click, call `supabase.functions.invoke("find-matching-trips", { body: { parcelId } })`
- Show loading spinner while retrying, then toast success/failure
- Add a `retrying` state to track which parcel ID is being retried

### 4. Matched Traveler Info -- Name and Phone Only
In `src/pages/SenderDashboard.tsx`:

- In the matched traveler section, remove the email line
- Show only: Name and Phone
- Keep trip date for context

### 5. Earlier Traveler Reassignment (Edge Function)
This is the most complex change. When a new trip is created that could deliver a parcel sooner than an existing accepted match:

**New edge function: `supabase/functions/check-earlier-traveler/index.ts`**
- Called after `find-matching-parcels` completes (from `PostTrip.tsx`)
- For each matched parcel that already has an accepted match:
  - Compare the new trip's `travel_date` with the existing accepted match's trip `travel_date`
  - If the new trip is sooner, send a notification to the sender asking if they want to reassign
  - The notification content includes: "An earlier traveler (traveling on [date]) is available for your parcel. Would you like to reassign?"
  - Store the potential new match ID in the notification's `related_match_id`

**Sender Dashboard reassignment UI:**
- When a sender views a matched parcel, if there's a notification of type `earlier_traveler_available`, show a prompt: "An earlier traveler is available (traveling [date]). Reassign?"
- Two buttons: "Keep Current" (dismisses notification) and "Reassign"
- "Reassign" calls a new edge function `reassign-parcel`

**New edge function: `supabase/functions/reassign-parcel/index.ts`**
- Accepts `{ parcelId, newMatchId }`
- Sets the old match status to `reassigned`
- Sets the new match status to `accepted`
- Updates the parcel's `traveler_id`
- Notifies the old traveler: "The parcel has been reassigned to an earlier traveler"
- Notifies the sender: "Your parcel has been reassigned successfully"

**Database migration:**
- Add `'reassigned'` to the matches status check constraint (if one exists) -- currently it's just a text field so no constraint change needed
- No new tables required; uses existing `notifications` and `matches` tables

### 6. Update `supabase/config.toml`
Register the two new edge functions:
- `check-earlier-traveler` with `verify_jwt = false`
- `reassign-parcel` with `verify_jwt = false`

---

## Technical Details

### Files Created
- `src/config/cities.ts` -- shared city constants
- `supabase/functions/check-earlier-traveler/index.ts` -- detect earlier travelers for matched parcels
- `supabase/functions/reassign-parcel/index.ts` -- handle reassignment

### Files Modified
- `src/pages/SmallParcelBooking.tsx` -- required date pickers, shared cities, remove pickupDate field
- `src/components/PostTrip.tsx` -- shared cities, calendar picker for travel date, call check-earlier-traveler after matching
- `src/pages/FreightEstimator.tsx` -- shared cities
- `src/pages/SenderDashboard.tsx` -- retry button, reassignment UI, remove email from traveler info
- `src/pages/TravelerDashboard.tsx` -- no changes needed (already uses route-based matching)
- `supabase/config.toml` -- register new edge functions

### Matching Date Logic
The existing `find-matching-parcels` edge function already filters by `pickup_earliest` and `pickup_latest`. Making these fields required ensures every parcel has a valid date window, which dramatically improves match quality. The `check-earlier-traveler` function adds a second pass that compares against already-accepted matches.

### Free Tier Compliance
- No new database tables or `pg_cron` usage
- Edge function invocations are minimal (one extra call per trip post)
- All changes stay within Supabase free tier limits

