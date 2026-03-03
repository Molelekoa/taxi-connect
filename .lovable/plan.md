

# Consolidated Plan: Realtime Approval, Document Viewing, Geotag Delivery Option, Duplicate Registration Prevention

## Summary

Four changes: (1) traveler dashboard updates in realtime when admin approves, (2) admin can view uploaded traveler documents, (3) delivery proof gets an optional geotag alongside the existing photo upload, (4) users who already registered for a role see a message instead of the form.

---

## 1. Realtime Traveler Approval Status

**File: `src/pages/TravelerDashboard.tsx`**

The dashboard fetches `travelerStatus` once on mount and never updates. Add a Supabase realtime channel subscription on `traveler_profiles` filtered by `profile_id`, listening for UPDATE events. When the status column changes, update local state immediately -- no page refresh needed.

- Subscribe in the same `useEffect` that calls `fetchData()`
- Clean up the channel on unmount
- ~15 lines of code added

---

## 2. Admin: View Traveler Documents

**File: `src/pages/AdminDashboard.tsx`**

The `TravelerProfile` type is missing `id_copy_url` and `license_copy_url`. The TravelerSheet does not display them.

- Add `id_copy_url` and `license_copy_url` to the `TravelerProfile` type
- Include them in the traveler profiles query (they're already in the DB)
- Add a "Documents" section to the `TravelerSheet` component
- For each URL that exists, render a clickable link that opens the document in a new tab (these are stored as full signed URLs from the upload-document edge function, so they can be opened directly)

---

## 3. Delivery Proof: Keep Photo, Add Geotag Option

**Approach**: The simplest, lightest option -- no Mapbox API call needed. The browser Geolocation API (`navigator.geolocation.getCurrentPosition()`) returns GPS coordinates for free, with zero external dependencies. Store raw lat/lng on the parcel record alongside the existing photo.

The traveler sees two options in the delivery dialog:
- **Upload Photo** (existing flow, unchanged)
- **Tag My Location** -- one button tap, captures GPS coordinates, shows a confirmation with lat/lng. No map rendering, no reverse geocoding, no Mapbox cost.

Both can be submitted together or individually. The admin sees coordinates displayed as text in the Delivery Approvals tab (clickable link to Google Maps for verification).

### Why this is the lightest approach
- `navigator.geolocation` is a browser built-in -- zero dependencies, zero API calls, zero cost
- No Mapbox usage for geotagging (saves API calls and data)
- No map component rendered (saves bundle size)
- Coordinates stored as two numeric columns (8 bytes each vs image blob)
- Admin verifies via a Google Maps link -- no embedded map needed

### Database migration
Add three columns to `parcels`:
```sql
ALTER TABLE public.parcels
  ADD COLUMN delivery_lat numeric,
  ADD COLUMN delivery_lng numeric,
  ADD COLUMN delivery_geotagged_at timestamptz;
```

### Edge function change
**File: `supabase/functions/submit-delivery-proof/index.ts`**
- Accept optional `lat` and `lng` fields alongside the existing `photoUrl`
- Require at least one of `photoUrl` or `lat+lng`
- Store coordinates and timestamp on the parcel if provided

### Frontend changes
**File: `src/pages/TravelerDashboard.tsx`**
- Add a "Tag My Location" button to the delivery proof dialog using `navigator.geolocation.getCurrentPosition()`
- Show captured coordinates as confirmation text
- Submit both photo URL and coordinates to the edge function

**File: `src/pages/AdminDashboard.tsx`**
- In `DeliveryApprovalsTab`, show coordinates as a clickable Google Maps link when present

---

## 4. Prevent Duplicate Registration

**File: `src/pages/CarrierSignup.tsx`**

On mount (when user is logged in), check:
- Query `traveler_profiles` for existing record with user's `profile_id`
- Query `profiles` for `role === "sender"`

If already registered for a role:
- Show "You're already registered as a Traveler" with a link to `/traveler-dashboard`
- Show "You're already registered as a Sender" with a link to `/sender-dashboard`
- Hide or disable the corresponding registration form tab

Requires importing `useAuth` and `supabase`, adding a `useEffect` with two queries, and conditional rendering.

---

## Files Modified
- `src/pages/TravelerDashboard.tsx` -- realtime subscription, geotag in delivery dialog
- `src/pages/AdminDashboard.tsx` -- document URLs in TravelerSheet, geotag display in DeliveryApprovalsTab
- `src/pages/CarrierSignup.tsx` -- duplicate registration check
- `supabase/functions/submit-delivery-proof/index.ts` -- accept optional lat/lng
- Database migration -- add 3 columns to `parcels`

