

# Plan: Admin Notifications, Document Viewing Fix, and Parcel Status Tracking

## Issues Found

### 1. Document links show "Not uploaded" — two problems
- The existing traveler record has `id_copy_url = null` and `license_copy_url = null`, meaning documents weren't uploaded during that registration.
- Even when documents ARE uploaded, the `register-traveler` function stores **file paths** (e.g. `userId/id-copy-file.jpg`), not URLs. The admin TravelerSheet tries to use these as `<a href={...}>` links, which won't work. The admin needs **signed URLs** generated from these storage paths using `supabase.storage.from("documents").createSignedUrl()`.

**Fix**: Update the `TravelerSheet` to detect when the value is a storage path (not a full URL) and generate a signed URL on-the-fly. Add a small async helper that creates signed URLs when the sheet opens. Also add a "No documents uploaded" message when both are null.

### 2. Admin notification on delivery status change — already partially done
The `submit-delivery-proof` edge function already notifies admins when a traveler submits delivery proof (lines 126-146). However, other status changes (collected, in-transit) by the traveler do NOT notify the admin.

**Fix**: Add a realtime subscription in `AdminDashboard` on the `parcels` table listening for status UPDATE events. When a parcel status changes, show a toast notification and auto-refresh the parcels list. This gives the admin live visibility into all status transitions without requiring edge function changes for every status update.

### 3. Parcel status tracking for admin communication
The admin currently has no way to see a timeline of status changes. The audit log captures status changes but in a generic format.

**Fix**: Add a "Status History" section to the `ParcelDetailSheet` that queries the `audit_log` table filtered by `table_name = 'parcels'` and the parcel's `record_id`. This shows a chronological timeline of all status transitions (who changed it, when, from what to what).

### 4. Missing fields in Parcel type
The `Parcel` type in AdminDashboard is missing `delivery_lat`, `delivery_lng`, and `delivery_geotagged_at` — these were added to the database but the type wasn't updated.

**Fix**: Add these three fields to the `Parcel` type and remove the `as any` casts in the DeliveryApprovalsTab.

---

## Files Modified

- **`src/pages/AdminDashboard.tsx`**:
  - Fix `Parcel` type to include geotag fields
  - Fix `TravelerSheet` to generate signed URLs for document paths
  - Add realtime subscription on `parcels` table for live status change toasts
  - Add status history timeline in `ParcelDetailSheet` (from audit_log)
  - Remove `as any` casts in DeliveryApprovalsTab

No database changes needed. No edge function changes needed.

