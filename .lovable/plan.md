# Plan: Fix Traveler Dashboard Display & Admin Notification Issues

## Problems Identified

1. **Traveler Dashboard cards lack detail** — the screenshots confirm parcels show minimal info. The Browse and Matched tabs need prominent suburb, addresses, and pickup dates. Sender/recipient details and weight band must be hidden until after acceptance.
2. **Admin status notifications silently fail** — The `notifications` table RLS policy "Admins can insert notifications" is **RESTRICTIVE** (not PERMISSIVE). PostgreSQL requires at least one PERMISSIVE policy to pass for a given command. With only a RESTRICTIVE INSERT policy and no PERMISSIVE one, all inserts are denied. The admin dashboard code doesn't throw on notification insert failure, so the status update succeeds but the notification is silently swallowed.

## Changes

### 1. Database Migration — Fix notifications INSERT RLS

Drop the existing RESTRICTIVE admin insert policy and recreate it as **PERMISSIVE**. This allows admin-role users to actually insert notifications.

### 2. TravelerDashboard.tsx — Restructure parcel cards

**Browse & Matched tabs (pre-acceptance):** Show:

- Route (pickup_location → dropoff_location)
- Suburb
- Pickup address & delivery address
- Pickup window (earliest – latest)
- Payout estimate
- Description/dimensions  
Weight Band

Hide: sender name/phone, recipient name/phone.

**Carrying tab (accepted):** Show all of the above PLUS:

- Sender name & phone
- Recipient name & phone

**Delivered tab (accepted):** Same as Carrying — full details visible.

### 3. AdminDashboard.tsx — Handle notification insert errors

Add error checking on the notification insert so failures are surfaced rather than swallowed silently.

## Files Modified

- New migration SQL — fix notifications INSERT RLS policy
- `src/pages/TravelerDashboard.tsx` — restructure all four tab card layouts
- `src/pages/AdminDashboard.tsx` — add error handling on notification insert