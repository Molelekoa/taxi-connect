

# Performance Indexes, Security Audit Logging, and Observability -- Free Plan

## Overview
This plan implements database indexes for query performance, an audit logging system, and an observability strategy -- all within Supabase's free tier constraints. Since `pg_cron` requires the Pro plan, retry logic will be handled application-side rather than via scheduled database jobs.

## Current State
- **Triggers**: `after_parcel_insert` and `after_trip_insert` are active (confirmed working)
- **Extensions**: `pg_net` is available; `pg_cron` is NOT (requires Pro)
- **Indexes**: Only primary keys and unique constraints exist -- no performance indexes
- **Linter**: Only issue is "Leaked Password Protection Disabled" (a Supabase Auth dashboard setting, not code)

## What Will Change

### 1. Database Performance Indexes (Migration)

Add composite indexes targeting the most frequent query patterns:

```text
parcels table:
  - (status, pickup_location, dropoff_location) -- matching engine + browse parcels
  - (sender_id, status)                         -- sender dashboard queries
  - (traveler_id)                               -- traveler assigned parcels

trips table:
  - (status, origin_city, destination_city, travel_date) -- matching engine
  - (traveler_id, status)                                -- traveler dashboard

matches table:
  - (parcel_id, trip_id)     -- duplicate match prevention
  - (trip_id, status)        -- traveler match queries
  - (parcel_id, status)      -- sender match queries

notifications table:
  - (user_id, read, created_at DESC) -- notification bell queries

traveler_routes table:
  - (traveler_profile_id)    -- route lookups for browse parcels
```

### 2. Audit Logging (Migration)

Create an `audit_log` table to track sensitive operations. Since we can't use `pg_cron`, we'll use a lightweight trigger-based approach:

```text
audit_log table:
  - id (uuid)
  - action (text): 'traveler_approved', 'traveler_rejected', 'parcel_claimed', 'match_accepted', 'status_changed'
  - table_name (text)
  - record_id (uuid)
  - old_values (jsonb)
  - new_values (jsonb)
  - performed_by (uuid) -- auth.uid()
  - created_at (timestamptz)
```

Triggers will automatically log:
- Traveler profile status changes (approval/rejection)
- Parcel status changes (pending to matched, etc.)
- Match status changes (pending to accepted)

RLS: Only admins can read audit logs. No client inserts/updates/deletes (triggers handle insertion).

### 3. Edge Function Retry Logic

Since `pg_cron` is unavailable on the free plan, add client-side retry logic:
- Update `SmallParcelBooking.tsx`: After successful parcel creation, call `find-matching-trips` directly as a fallback if the trigger doesn't fire
- Update `TravelerDashboard.tsx` (trip posting): After posting a trip, call `find-matching-parcels` directly
- This provides a belt-and-suspenders approach alongside the database triggers

### 4. Observability Strategy (No-Cost)

Since external monitoring tools (Sentry, Datadog) would add cost, the plan uses what's already available:

**Built into Supabase free tier:**
- Edge Function logs (already available in dashboard)
- Database logs via `supabase--analytics-query`
- Auth logs

**Application-level (new):**
- Add a simple `app_metrics` table to track key business events:
  - Parcels created per day
  - Matches made per day
  - Claims completed per day
- A lightweight database function `log_metric(metric_name, value)` that inserts into this table
- Admin Dashboard gets a new "Metrics" tab showing these counts

**No additional cost required.**

---

## Technical Details

### Files Modified
- `src/pages/SmallParcelBooking.tsx` -- Add fallback matching call after parcel creation
- `src/pages/TravelerDashboard.tsx` -- Add fallback matching call after trip creation
- `src/pages/AdminDashboard.tsx` -- Add "Audit Log" and "Metrics" tabs

### Database Migration (single migration)
1. Create all performance indexes
2. Create `audit_log` table with RLS (admin-only SELECT)
3. Create audit trigger functions for `traveler_profiles`, `parcels`, and `matches`
4. Create `app_metrics` table for observability
5. Create `log_metric()` function

### Security Notes
- Audit log table uses `SECURITY DEFINER` trigger functions so logging works regardless of the calling user's permissions
- No client-side INSERT policy on `audit_log` -- only triggers can write
- Leaked Password Protection should be enabled manually in Supabase Auth settings (dashboard only, not code)

### Free Plan Constraints Respected
- No `pg_cron` usage (Pro only)
- No external monitoring services
- All indexes are B-tree (default, no extensions needed)
- Audit log and metrics tables add minimal storage overhead
- Edge function invocations stay well within free tier limits for under 50,000 users

