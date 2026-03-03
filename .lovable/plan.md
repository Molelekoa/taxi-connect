

# Plan: Enhanced Delivery Approval Flow with Geotag Details, Payment Notification, and Status Sync

## What's Happening Now

1. **Admin Deliveries tab** only shows `pending_confirmation` parcels. Once approved, the parcel disappears — there's no way to review delivered parcels or their geotag/photo proof after approval.
2. **Admin approve action** (`onApprove`) just sets status to `delivered` via a raw update. It does NOT notify the traveler or insert a notification record.
3. **Traveler Dashboard** only shows `accepted` matches in the "Carrying" tab. Once the parcel moves to `pending_confirmation` or `delivered`, it vanishes — the traveler never sees a "Delivered" confirmation or payment info.

## Changes

### 1. Admin Deliveries Tab — Show Full Parcel Details + Delivered History
- Show all parcel details (sender, recipient, addresses, weight, price, description) in each delivery approval card — not just the route summary.
- Add a sub-section showing delivered parcels below the pending ones so the admin can review past approvals with their geotag/photo proof.
- The existing geotag Google Maps link and photo display already work — they just need to remain visible after approval.

**File**: `src/pages/AdminDashboard.tsx` — expand `DeliveryApprovalsTab` to show full details and include a "Recently Delivered" section filtered by `status === "delivered"`.

### 2. Admin Approve → Notify Traveler with Payment Timeline
When the admin clicks "Approve Delivery":
- Update parcel status to `delivered` (existing).
- Insert a notification for the traveler with payment timeline logic:
  - If delivery day is Mon–Thu: "Payment will be made within 72 hours."
  - If delivery day is Fri–Sun: "Payment will be made on Wednesday."
- This notification insert uses the service role via the existing `updateStatus` mutation path. Since `notifications` INSERT requires service role (no client INSERT policy), we'll create a small edge function `approve-delivery` that handles both the status update and notification insert atomically.

**New file**: `supabase/functions/approve-delivery/index.ts` — accepts `{ parcelId }`, sets status to `delivered`, calculates payment date, inserts notification for the traveler.

### 3. Traveler Dashboard — Show Delivered Parcels
- Add a "Delivered" section or tab showing parcels with `status === "delivered"` or `pending_confirmation`.
- When a parcel is approved by admin, the traveler sees it move to "Delivered" with the payment message from the notification.
- Add a realtime subscription on `parcels` (filtered by traveler's matches) to auto-update when admin approves.

**File**: `src/pages/TravelerDashboard.tsx` — fetch delivered matches, display them in the "Carrying" tab with a "Delivered" badge and payment info.

### 4. Admin Dashboard Status Sync
- When admin approves delivery, invalidate both parcels and deliveries queries so the parcel moves from "Deliveries" pending list to the delivered section and updates the Parcels tab status.

**File**: `src/pages/AdminDashboard.tsx` — update the approve handler to call the new edge function instead of raw status update.

## Files Modified
- `src/pages/AdminDashboard.tsx` — expanded delivery details, delivered history, new approve handler
- `src/pages/TravelerDashboard.tsx` — show delivered parcels with payment timeline
- `supabase/functions/approve-delivery/index.ts` — new edge function for atomic approval + notification
- `supabase/config.toml` — register new edge function

