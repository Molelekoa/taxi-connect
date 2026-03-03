

# Diagnosis, Error Tracking, and Sender Parcel Deletion

## Diagnosis: Accept-Match Failure

The edge function logs show **no error logs** for `accept-match` -- only boot/shutdown. However, the analytics reveal **401 errors on `find-matching-trips` and `find-matching-parcels`** called by database triggers. The `accept-match` CORS headers are missing the extended Supabase client headers (`x-supabase-client-platform`, etc.), which can cause preflight failures on some browsers/clients. The current `accept-match` CORS header is:

```
"authorization, x-client-info, apikey, content-type"
```

But `claim-parcel` (which works) uses the full set:

```
"authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version"
```

**Root cause**: The `accept-match` edge function has incomplete CORS `Access-Control-Allow-Headers`, causing browsers to reject the preflight OPTIONS request. The client-side error message is generic ("Failed to accept") with no details logged server-side.

Additionally, the current audit log only tracks **successful** status changes via DB triggers -- it does not capture failed edge function calls or client-side errors.

## Plan

### 1. Fix accept-match CORS headers
**File: `supabase/functions/accept-match/index.ts`**
Update the `corsHeaders` to include the full set of Supabase client headers (matching `claim-parcel`).

### 2. Create an error_logs table for user-facing error tracking
**Database migration**: Create `error_logs` table with columns:
- `id` (uuid, PK)
- `user_id` (uuid, nullable) -- profile ID of the user who experienced the error
- `action` (text) -- e.g., "accept_match", "claim_parcel", "submit_delivery_proof"
- `error_message` (text) -- the error returned
- `context` (jsonb, nullable) -- extra data like matchId, parcelId
- `created_at` (timestamptz, default now())

RLS: Admins can SELECT. No client INSERT -- errors will be logged via edge functions using service role.

### 3. Add error logging to edge functions
**Files: `accept-match`, `claim-parcel`, `cancel-accepted-match`, `submit-delivery-proof`**
In each catch block and error response path, insert a row into `error_logs` with the action name, error message, user ID, and relevant context (matchId/parcelId).

### 4. Admin Dashboard -- Error Log tab
**File: `src/pages/AdminDashboard.tsx`**
Add an "Errors" tab showing recent entries from `error_logs` in a table: timestamp, user, action, error message, context. This gives admins visibility into user-facing failures.

### 5. Sender can delete pending parcels
**File: `src/pages/SenderDashboard.tsx`**
- Add a "Remove Parcel" button on parcels with `status === "pending"` (no accepted match yet).
- On click, show a confirmation dialog.
- On confirm, call `supabase.from("parcels").delete().eq("id", parcelId)`.
- The existing RLS policy "Senders can delete pending parcels" already permits this.

## Files Modified
- `supabase/functions/accept-match/index.ts` -- fix CORS, add error logging
- `supabase/functions/claim-parcel/index.ts` -- add error logging
- `supabase/functions/cancel-accepted-match/index.ts` -- add error logging
- `supabase/functions/submit-delivery-proof/index.ts` -- add error logging
- `src/pages/AdminDashboard.tsx` -- add Errors tab
- `src/pages/SenderDashboard.tsx` -- add delete parcel button with confirmation

## Database Migration
- Create `error_logs` table with admin-only SELECT RLS policy

