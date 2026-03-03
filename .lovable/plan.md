

# Plan: Delivery Verification System Enhancement

## Current State Analysis

**Already built:**
- Traveler proof submission UI (photo + geotag dialog) in TravelerDashboard
- `submit-delivery-proof` edge function (stores proof on parcels table)
- `approve-delivery` edge function (updates parcel to delivered, notifies traveler)
- Admin Deliveries tab with full details, photo, geotag, approve button
- Traveler "Delivered" tab showing pending_confirmation/delivered parcels
- Sender dashboard with basic status display

**What's missing:**
- Proof data on `matches` table (currently only on parcels) — `proof_photo_url`, `proof_geotag`, `proof_submitted_at`, `delivery_status`
- Reject functionality for admin (only approve exists)
- `verify-delivery` edge function (approve-delivery is close but lacks reject path)
- Human-readable delivery status labels in sender dashboard
- `delivered_pending_verification` and `delivered_verified` status values in the parcels CHECK constraint

## Changes

### 1. Database Migration
Add columns to `matches` table:
- `proof_photo_url` (text, nullable)
- `proof_geotag` (jsonb, nullable)
- `proof_submitted_at` (timestamptz, nullable)
- `delivery_status` (text, default null) — values: `delivered_pending_verification`, `delivered_verified`, `rejected`

Update parcels status CHECK constraint to also allow `delivered_pending_verification` and `delivered_verified`.

### 2. Update `submit-delivery-proof` Edge Function
In addition to updating the parcel, also update the match record with `proof_photo_url`, `proof_geotag` (JSON with lat/lng), `proof_submitted_at`, and set `delivery_status = 'delivered_pending_verification'`. Change parcel status to `delivered_pending_verification` instead of `pending_confirmation`.

### 3. New `verify-delivery` Edge Function
Accepts `{ matchId, action: "approve" | "reject" }`. On approve: set match `delivery_status = 'delivered_verified'`, update parcel status to `delivered_verified`, notify traveler with payment timeline, notify sender. On reject: set match `delivery_status = 'rejected'`, reset parcel status to matched/accepted, notify traveler to resubmit proof.

### 4. Admin Dashboard — Deliveries Tab
- Update filter to show `delivered_pending_verification` parcels (instead of `pending_confirmation`)
- Show proof photo thumbnail from match record
- Show geotag as Google Maps link from match `proof_geotag`
- Show `proof_submitted_at` date
- Add traveler name and sender name (join via match → trip → profile)
- Add "Reject" button alongside "Approve" — reject calls `verify-delivery` with `action: "reject"`
- "Delivered" section filters by `delivered_verified` status
- Update status config and STATUSES array for new values

### 5. Sender Dashboard — Human-Readable Statuses
Update `statusConfig` in SenderDashboard to map:
- `pending` → "Matched, awaiting pickup"
- `matched` → "Matched, awaiting pickup"
- `collected` / `in_transit` → "On the way"
- `delivered_pending_verification` → "Delivered – awaiting admin confirmation"
- `delivered_verified` → "Delivered – confirmed"
- `delivered` → "Delivery complete"

### 6. Traveler Dashboard
- Update delivered tab filter to include `delivered_pending_verification` and `delivered_verified`
- Show appropriate status labels for new statuses

## Files Modified
- **Database migration** — add columns to matches, update parcels CHECK constraint
- `supabase/functions/submit-delivery-proof/index.ts` — also write proof to match record
- `supabase/functions/verify-delivery/index.ts` — **new** edge function for approve/reject
- `supabase/config.toml` — register verify-delivery
- `src/pages/AdminDashboard.tsx` — update deliveries tab filters, add reject button, new statuses
- `src/pages/SenderDashboard.tsx` — human-readable status labels
- `src/pages/TravelerDashboard.tsx` — update filters for new statuses

