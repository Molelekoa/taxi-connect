
# Admin Dashboard for Shipment Coordination

## Security Scan Summary

After loading the full security scan results, there are **zero findings at the "error" level**. All identified findings are at `warn` or `info` severity. Since you asked to only address `error`-level items, no security fixes are needed from this scan.

---

## Main Request: Admin Dashboard

You need a way to track user data and coordinate shipments as an administrator. Here is what will be built:

---

## What Gets Built

### 1. Admin Role Hook (`src/hooks/useIsAdmin.ts`)
A React hook that calls the existing `has_role` database function server-side to check if the current user is an admin. This is the secure, RLS-based approach — no client-side credential checks.

### 2. Admin-Protected Route (`src/components/AdminRoute.tsx`)
A route guard that:
- Checks if the user is logged in (via `useAuth`)
- Calls `useIsAdmin` to verify admin role from the database
- Redirects non-admins to `/` with no access

### 3. Admin Dashboard Page (`src/pages/AdminDashboard.tsx`)
A full-screen admin panel at `/admin` with four tabbed sections:

**Tab 1 — Overview (Summary Cards)**
- Total registered users
- Total senders vs travelers
- Total parcels by status (pending, in-transit, delivered)
- Recent registrations count

**Tab 2 — Users & Registrations**
A table listing all profiles showing:
- Name, email, phone, country
- Role (sender / traveler / unregistered)
- Registration date
- One-click copy of email/phone for contact
- Link to view traveler profile details in a slide-out sheet

**Tab 3 — Parcels & Shipments**
A table of all parcels showing:
- Pickup and dropoff locations
- Weight, price, description
- Current status with a colored badge (Pending / Collected / In Transit / Delivered)
- Sender and traveler names (joined from profiles)
- Admin can update parcel status using a dropdown inline

**Tab 4 — Travelers**
A table of all traveler profiles showing:
- Name, vehicle type, routes (primary from/to)
- License type, cargo types, capacity
- Schedule and frequency
- Emergency contact details for coordination

### 4. Navbar Admin Link
When the logged-in user is an admin, a "Admin" link appears in the navbar pointing to `/admin`.

### 5. Route in App.tsx
Add `/admin` as an `AdminRoute`-protected route.

---

## Database Requirements

The existing RLS policies already support admins reading all data:
- `profiles` — "Users can view their own profile" allows `has_role(auth.uid(), 'admin')`
- `traveler_profiles` — Admin SELECT allowed
- `traveler_routes` — Admin SELECT allowed
- `parcels` — "Parcel parties can view parcels" allows admin
- Admin parcel UPDATE is also allowed

No new database migrations are needed. All admin data access works through the existing RLS policies.

---

## How You Become an Admin

To assign yourself admin access, run this SQL once in the Supabase SQL Editor (using your user's auth UUID):

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<your-auth-user-id>', 'admin');
```

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/hooks/useIsAdmin.ts` | Create | Server-side admin role check |
| `src/components/AdminRoute.tsx` | Create | Admin-only route guard |
| `src/pages/AdminDashboard.tsx` | Create | Full admin panel UI |
| `src/App.tsx` | Modify | Add `/admin` route |
| `src/components/Navbar.tsx` | Modify | Show Admin link for admins |

---

## Technical Details

- The `useIsAdmin` hook calls `supabase.rpc('has_role', { _user_id: uid, _role: 'admin' })` — server-side, unforgeable
- All data fetching uses `@tanstack/react-query` for caching and loading states
- The admin dashboard fetches profiles, traveler_profiles with traveler_routes, and parcels separately and joins them client-side
- Parcel status updates call `supabase.from('parcels').update({ status })` which is already allowed by the "Admins can update any parcel" RLS policy
- Status badges use color-coded UI: Pending (yellow), Collected (blue), In Transit (orange), Delivered (green)
- Contact info (email, phone) is displayed directly in the Users tab with a one-click copy button for quick coordination
