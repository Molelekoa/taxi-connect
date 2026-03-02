

# Traveler Payout Display, Parcel Cancellation, Delivery Confirmation, and Address Improvements

## Overview
This plan covers six changes: (1) show traveler payout (65%) instead of full price across all traveler-facing sections, (2) allow travelers to cancel accepted parcels with reasons, (3) add delivery confirmation flow with photo proof, (4) sender delivery confirmation, (5) admin-only approval of deliveries, and (6) improve address capture on the booking form.

## Changes

### 1. Traveler Dashboard -- Show Payout (65%) Instead of Full Price

**File: `src/pages/TravelerDashboard.tsx`**

In three places where `parcel.price` is displayed:

- **Browse Parcels tab** (line 287): Already shows `R{Math.round(Number(parcel.price) * 0.65)}` -- this is correct.
- **Matched (pending) tab** (lines 321-352): Currently shows no price. Add payout display: "Your payout: R{Math.round(Number(match.parcels?.price) * 0.65)}" as a highlighted line.
- **Accepted tab** (lines 366-382): Currently shows no price. Add payout display similarly.
- **My Trips tab**: No price shown (trips don't have prices) -- no change needed.

All payout lines will use a green-highlighted style: `font-medium text-success` to entice travelers.

### 2. Traveler Can Cancel Accepted Parcels

**File: `src/pages/TravelerDashboard.tsx`**

- Add a "Cancel Delivery" button on each accepted match card.
- On click, show a dialog/popover with three reason options:
  - "Trip cancelled"
  - "No room for parcel"
  - "Could not reach sender"
- Add state: `cancelling` (match ID being cancelled), `cancelReason` (selected reason), `showCancelDialog` (match ID for which dialog is open).
- On confirm, call a new edge function `cancel-accepted-match`.

**New Edge Function: `supabase/functions/cancel-accepted-match/index.ts`**

- Accepts `{ matchId, reason }`.
- Verifies caller owns the trip for this match.
- Updates match status to `cancelled`.
- Resets parcel status back to `pending` and clears `traveler_id`.
- Notifies the sender: "Your traveler has cancelled the delivery. Reason: {reason}. We're searching for a new traveler."
- Re-triggers `find-matching-trips` for the parcel to find a replacement.

**Update `supabase/config.toml`**: Add `cancel-accepted-match` with `verify_jwt = false`.

### 3. Delivery Confirmation -- Traveler Marks as Delivered with Photo

**File: `src/pages/TravelerDashboard.tsx`**

- On accepted match cards, add a "Mark as Delivered" button.
- On click, open a dialog requiring a photo upload (proof of delivery at destination).
- Photo upload uses the existing `upload-document` edge function with purpose `delivery-proof`.
- On submit, call a new edge function `submit-delivery-proof`.

**New Edge Function: `supabase/functions/submit-delivery-proof/index.ts`**

- Accepts `{ matchId, photoUrl }`.
- Verifies caller owns the trip.
- Updates parcel status to `pending_confirmation` (new status).
- Stores `photo_url` on the parcel record.
- Notifies the sender: "Your traveler reports the parcel has been delivered. Awaiting admin confirmation."
- Notifies admins (users with admin role) of a new delivery pending approval.

**Database Migration:**
- Add `'pending_confirmation'` to the parcels status values (the CHECK constraint currently allows: available, pending, matched, collected, in_transit, delivered, cancelled). Add `pending_confirmation` to this list.

### 4. Sender Confirms Delivery Arrived

**File: `src/pages/SenderDashboard.tsx`**

- For parcels with status `pending_confirmation`, show a banner: "Your traveler reports this parcel has been delivered."
- Add a "Confirm Arrival" button that updates a `sender_confirmed` flag.
- This does NOT change parcel status to `delivered` -- only the admin can do that.
- Call edge function or direct update to set a `sender_confirmed_at` timestamp on the parcel.

**Database Migration:**
- Add `sender_confirmed_at` (timestamp, nullable) column to `parcels` table.

### 5. Admin Approves Delivery

**File: `src/pages/AdminDashboard.tsx`**

- Add a filter/section for parcels with status `pending_confirmation`.
- Show the delivery proof photo, sender confirmation status, and an "Approve Delivery" button.
- On approve, update parcel status to `delivered`.
- Notify both sender and traveler that delivery is confirmed.

### 6. Address Capture on Booking Form

**File: `src/pages/SmallParcelBooking.tsx`**

The form already has:
- Origin City dropdown (line 761-769) -- uses `CITY_OPTIONS` via `LocationInput`
- Pickup Address text field (line 772-780) -- mandatory
- Destination City dropdown (line 854-863) -- uses `CITY_OPTIONS`
- Delivery Address text field (line 866-874) -- mandatory

These are already implemented correctly with city dropdown + mandatory physical address. The labels and placeholders will be improved:
- Pickup Address placeholder: "e.g., 12 Main Road, Sandton" (more specific)
- Delivery Address placeholder: "e.g., 45 Church Street, Hatfield" (more specific)
- Ensure `pickupAddress` validation requires min 5 characters (already does)
- Ensure `deliveryAddress` validation requires min 5 characters (currently min 3 -- update to min 5)

### 7. Remove Email from Traveler Accepted Tab

**File: `src/pages/TravelerDashboard.tsx`**

- Line 379: Remove `{match.parcels?.sender_email && <p>Email: ...</p>}` from accepted matches.
- Keep only sender name and phone.

---

## Technical Details

### Files Created
- `supabase/functions/cancel-accepted-match/index.ts` -- traveler cancels accepted delivery
- `supabase/functions/submit-delivery-proof/index.ts` -- traveler submits delivery photo

### Files Modified
- `src/pages/TravelerDashboard.tsx` -- payout display, cancel button, mark delivered button, remove email
- `src/pages/SenderDashboard.tsx` -- sender confirms arrival UI
- `src/pages/AdminDashboard.tsx` -- delivery approval section
- `src/pages/SmallParcelBooking.tsx` -- address placeholder improvements, deliveryAddress min length
- `supabase/config.toml` -- register new edge functions

### Database Migration
- Add `'pending_confirmation'` to parcels status CHECK constraint
- Add `sender_confirmed_at` timestamp column to parcels

### Payout Calculation
All traveler-facing prices use: `Math.round(Number(price) * 0.65)` -- the 65% revenue share. This is consistent with the existing Browse Parcels implementation.

