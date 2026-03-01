

# Connect Senders and Travelers: End-to-End Matching

## Problem Summary
Currently, the sender and traveler sides of the platform are disconnected:
1. Database triggers that power automatic matching were never created (confirmed: zero triggers exist)
2. There's no admin approval step for travelers before they can operate
3. Travelers can't see available parcels on their routes
4. When a traveler claims a parcel, the sender doesn't get notified reliably

## Plan

### 1. Add Admin Approval for Travelers
Add a `status` column to the `traveler_profiles` table (values: `pending`, `approved`, `rejected`, default `pending`). Only approved travelers can post trips and see parcels.

**Admin Dashboard changes:**
- Add Approve/Reject buttons in the Travelers tab next to each traveler
- Show traveler status badges (Pending, Approved, Rejected)

### 2. Re-create Database Triggers
The `after_parcel_insert` and `after_trip_insert` triggers were never successfully applied. Create a new migration to add them, connecting parcel inserts to `find-matching-trips` and trip inserts to `find-matching-parcels`.

### 3. Add a "Browse Available Parcels" View for Travelers
Instead of relying solely on automated matching (which depends on triggers), give approved travelers a direct way to browse pending parcels that match their registered routes. This provides a fallback and a more intuitive experience.

**Traveler Dashboard changes:**
- New "Browse Parcels" tab showing all pending parcels matching the traveler's registered routes (from `traveler_routes` table)
- Each parcel card shows route, weight, pickup window, and a "Claim" button
- Claiming creates a match record and notifies the sender

### 4. Build a "Claim Parcel" Edge Function
A new `claim-parcel` edge function that:
- Validates the traveler is approved
- Checks the parcel is still pending/available
- Creates a match record (or uses existing one)
- Updates parcel status to "matched"
- Notifies the sender

### 5. Fix Sender Notifications
Ensure the sender dashboard and notification bell correctly show when a traveler claims their parcel, including the traveler's name and contact info.

---

## Technical Details

### Database Migration
```sql
-- Add status to traveler_profiles
ALTER TABLE public.traveler_profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Re-create triggers
CREATE TRIGGER after_parcel_insert
  AFTER INSERT ON public.parcels
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_parcel();

CREATE TRIGGER after_trip_insert
  AFTER INSERT ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_trip();
```

### File Changes

**New files:**
- `supabase/functions/claim-parcel/index.ts` -- Traveler claims a parcel directly

**Modified files:**
- `src/pages/AdminDashboard.tsx` -- Add approve/reject buttons for travelers, status badges
- `src/pages/TravelerDashboard.tsx` -- Add "Browse Parcels" tab showing route-matched parcels with claim buttons, gate access behind approved status
- `src/pages/SenderDashboard.tsx` -- Improve match display to show traveler details after claim
- `supabase/config.toml` -- Register `claim-parcel` edge function

### Matching Logic for Browse
When a traveler opens "Browse Parcels", the app queries parcels where:
- `status = 'pending'`
- `pickup_location` matches any of the traveler's registered `route_from` cities
- `dropoff_location` matches the corresponding `route_to` cities
- `weight_kg` is within the traveler's capacity

This uses the existing `traveler_routes` table data, so no new trips need to be posted for basic matching.

### Security
- The `claim-parcel` function validates JWT, checks traveler approval status, and confirms parcel availability before creating a match
- RLS policies already protect data visibility; no changes needed
- Admin approval uses the existing admin role check via `has_role()`

