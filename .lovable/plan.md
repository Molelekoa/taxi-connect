

# Parcel-Traveler Matching System

## Overview
Build a complete matching engine that connects senders posting parcels with travelers who have active trips on matching routes. This includes new database tables, edge functions for automated matching, database triggers, UI dashboards for both travelers and senders, and an in-app notification system.

## Phase 1: Database Schema

### New Table: `trips`
Stores traveler trip availability. References `profiles.id` (not `auth.users`).

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | default `gen_random_uuid()` |
| traveler_id | uuid FK -> profiles.id | NOT NULL |
| origin_city | text | NOT NULL |
| destination_city | text | NOT NULL |
| travel_date | date | NOT NULL |
| available_weight_kg | numeric | NOT NULL |
| notes | text | nullable |
| status | text | default 'active' |
| created_at | timestamptz | default `now()` |

RLS policies:
- SELECT: owner (`owns_profile(traveler_id)`) or admin
- INSERT: owner (`owns_profile(traveler_id)`)
- UPDATE: owner or admin
- DELETE: owner or admin

### Alter Table: `parcels`
Add columns to support the matching pickup window (the existing parcels table lacks date range fields):
- `origin_city` text (alias for pickup_location -- we'll use the existing `pickup_location` and `dropoff_location` columns instead of creating duplicates)
- `pickup_earliest` date, nullable
- `pickup_latest` date, nullable
- `dimensions` text, nullable
- `photo_url` text, nullable

We will NOT add `origin_city`/`destination_city` since `pickup_location` and `dropoff_location` already serve this purpose.

### New Table: `matches`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | default `gen_random_uuid()` |
| parcel_id | uuid FK -> parcels.id | NOT NULL |
| trip_id | uuid FK -> trips.id | NOT NULL |
| status | text | default 'pending' |
| accepted_at | timestamptz | nullable |
| created_at | timestamptz | default `now()` |

RLS policies:
- SELECT: parcel sender or trip traveler or admin
- INSERT: service role only (edge functions insert via service role)
- UPDATE: trip traveler (to accept/reject) or admin

### New Table: `notifications`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | default `gen_random_uuid()` |
| user_id | uuid FK -> profiles.id | NOT NULL |
| type | text | e.g. 'new_match', 'match_accepted' |
| content | text | NOT NULL |
| read | boolean | default false |
| related_match_id | uuid FK -> matches.id | nullable, for linking |
| created_at | timestamptz | default `now()` |

RLS policies:
- SELECT: owner (`owns_profile(user_id)`)
- UPDATE: owner (to mark as read)
- INSERT: service role only

### Helper function: `get_profile_id_for_auth`
Already exists as `get_profile_id`. We'll reuse it.

## Phase 2: Edge Functions

### Edge Function: `find-matching-trips`
- Triggered after a parcel is inserted (via DB trigger using `pg_net`)
- Receives `{ parcelId }` in the request body
- Uses service role key to query trips matching:
  - Same `origin_city` = parcel's `pickup_location` (case-insensitive)
  - Same `destination_city` = parcel's `dropoff_location`
  - `travel_date` between parcel's `pickup_earliest` and `pickup_latest`
  - `available_weight_kg` >= parcel's `weight_kg`
  - Trip `status` = 'active'
- For each match: inserts into `matches` and `notifications` (for the traveler)
- Config: `verify_jwt = false`, validates via service role internally

### Edge Function: `find-matching-parcels`
- Triggered after a trip is inserted
- Receives `{ tripId }`
- Queries parcels matching:
  - Same route (pickup_location/dropoff_location match trip origin/destination)
  - `pickup_earliest` <= trip `travel_date` <= `pickup_latest`
  - `weight_kg` <= trip `available_weight_kg`
  - Parcel `status` = 'pending' (available)
- For each match: inserts into `matches` and `notifications` (for the sender)

### Edge Function: `accept-match`
- Called from the UI when a traveler accepts a match
- Receives `{ matchId }` + auth token
- Validates the traveler owns the trip associated with the match
- Updates match status to 'accepted', sets `accepted_at`
- Creates notification for the sender with traveler contact info
- Updates parcel status to 'matched'

## Phase 3: Database Triggers

Using `pg_net` extension (already available in Supabase) to call edge functions:

### Trigger: `after_parcel_insert`
```sql
CREATE OR REPLACE FUNCTION public.notify_new_parcel()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://jlhyoqfsyadxvuhfesmc.supabase.co/functions/v1/find-matching-trips',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object('parcelId', NEW.id)
  );
  RETURN NEW;
END;
$$;
```

### Trigger: `after_trip_insert`
Same pattern, calls `find-matching-parcels` with `tripId`.

**Note:** The triggers will use the Supabase service role key stored as a database setting. We'll use `SUPABASE_SERVICE_ROLE_KEY` secret which is already configured.

## Phase 4: UI Pages

### 4a. Traveler Dashboard (`src/pages/TravelerDashboard.tsx`)
- Protected route at `/traveler-dashboard`
- **My Trips tab**: List traveler's active trips with ability to add new trips (origin, destination, date, available weight)
- **Available Parcels tab**: Shows parcels matched to the traveler's trips (via the `matches` table). Each card shows weight, route, pickup window, and an "Accept" button
- **Accepted Parcels tab**: History of accepted deliveries with sender contact info

### 4b. Sender Dashboard (`src/pages/SenderDashboard.tsx`)
- Protected route at `/sender-dashboard`
- Lists sender's posted parcels with status badges
- For matched/accepted parcels, shows traveler name and contact details
- Pickup date fields added to the booking flow

### 4c. Post a Trip Component (`src/components/PostTrip.tsx`)
- Form for travelers to post a new trip: origin city, destination city, travel date, available weight, notes
- Integrated into the Traveler Dashboard

## Phase 5: Notifications

### 5a. Notification Bell Component (`src/components/NotificationBell.tsx`)
- Bell icon in the Navbar showing unread count badge
- Dropdown/popover listing recent notifications
- Click marks as read
- Each notification links to relevant match/parcel

### 5b. Real-time Updates
- Use Supabase Realtime to subscribe to `notifications` table changes for the logged-in user
- Bell count updates live without page refresh

## Phase 6: Integration Updates

### Navbar Updates (`src/components/Navbar.tsx`)
- Add NotificationBell next to the hamburger menu (visible only when logged in)
- Add "My Trips" and "My Parcels" links in the hamburger menu

### Booking Flow Updates (`src/pages/SmallParcelBooking.tsx`)
- Add `pickup_earliest` and `pickup_latest` date fields to the booking form
- These are stored on the parcel and used by the matching engine

### Route Registration (`src/App.tsx`)
- Add `/traveler-dashboard` (protected)
- Add `/sender-dashboard` (protected)

## Technical Details

### File Changes Summary

**New files:**
- `src/pages/TravelerDashboard.tsx` -- Traveler's trip management and parcel acceptance
- `src/pages/SenderDashboard.tsx` -- Sender's parcel tracking with match details
- `src/components/PostTrip.tsx` -- Trip posting form
- `src/components/NotificationBell.tsx` -- Bell icon with dropdown
- `supabase/functions/find-matching-trips/index.ts` -- Matching engine (parcel -> trips)
- `supabase/functions/find-matching-parcels/index.ts` -- Matching engine (trip -> parcels)
- `supabase/functions/accept-match/index.ts` -- Match acceptance logic

**Modified files:**
- `src/App.tsx` -- Add new routes
- `src/components/Navbar.tsx` -- Add NotificationBell, dashboard links
- `src/pages/SmallParcelBooking.tsx` -- Add pickup date range fields
- `supabase/config.toml` -- Register new edge functions

**Database migration:**
- Add `pickup_earliest`, `pickup_latest`, `dimensions`, `photo_url` columns to `parcels`
- Create `trips` table with RLS
- Create `matches` table with RLS
- Create `notifications` table with RLS
- Create trigger functions and triggers using `pg_net`
- Enable `pg_net` extension if not already enabled

### Matching Logic (City Matching)
Cities will be matched case-insensitively using `LOWER()`. This handles "Johannesburg" vs "johannesburg". For more advanced fuzzy matching (e.g., "JHB" = "Johannesburg"), we can add aliases in a future iteration.

### Security
- Edge functions use service role for DB operations (inserting matches/notifications)
- `accept-match` validates the caller owns the trip via `getClaims()` + `get_profile_id`
- RLS ensures users only see their own data
- Match acceptance checks trip ownership before updating

