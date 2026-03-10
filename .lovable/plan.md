

# Plan: Enhanced Traveler Verification, Parcel Photo Upload, and Approval Notifications

## Summary

This plan addresses four requirements:
1. **New traveler document uploads**: vehicle photo, license disk photo, proof of residence
2. **Admin document viewing**: all uploaded docs visible in admin traveler review
3. **Traveler approval notification**: when admin approves, send in-app notification so traveler knows they can view parcels
4. **Sender parcel photo**: require senders to upload a photo of their parcel before booking

---

## 1. Database Migration

Add three new columns to `traveler_profiles`:

```sql
ALTER TABLE traveler_profiles
  ADD COLUMN vehicle_photo_url text,
  ADD COLUMN license_disk_url text,
  ADD COLUMN proof_of_residence_url text;
```

Add `parcel_photo_url` column to `parcels` (already has a `photo_url` column but it's unused — we'll use that existing column instead if it exists, which it does).

**Decision**: The `parcels` table already has a `photo_url` column. We'll use that for the parcel photo upload. No parcels migration needed.

---

## 2. Traveler Registration Form Changes

### `types.ts`
Add three new fields to the form schema and initial data:
- `vehiclePhotoUploaded: z.string().min(1, "Vehicle photo is required")`
- `licenseDiskUploaded: z.string().min(1, "License disk photo is required")`
- `proofOfResidenceUploaded: z.string().min(1, "Proof of residence is required")`

### `Step3Vehicle.tsx`
Add three new upload boxes (reusing the same upload pattern from Step2License):
- **Vehicle Photo** — "Upload a clear photo of your vehicle"
- **License Disk on Window** — "Upload a photo of the license disk visible on the windscreen"
- **Proof of Residence** — "Upload a utility bill, bank statement, or similar document"

### `index.tsx` (CarrierRegistrationForm)
Append the three new files to the FormData before invoking `register-traveler`:
```
fd.append("vehiclePhoto", vehiclePhotoFile)
fd.append("licenseDisk", licenseDiskFile)
fd.append("proofOfResidence", proofOfResidenceFile)
```

### `register-traveler/index.ts` (Edge Function)
- Accept and validate the three new file uploads using `validateAndUploadFile`
- Store resulting paths in the new `traveler_profiles` columns

---

## 3. Admin Dashboard — View New Documents

### `AdminDashboard.tsx`

**TravelerProfile type**: Add `vehicle_photo_url`, `license_disk_url`, `proof_of_residence_url`.

**TravelerSheet component**: Add three new `DocumentLink` entries in the Documents section:
- Vehicle Photo
- License Disk
- Proof of Residence

---

## 4. Traveler Approval Notification

### `AdminDashboard.tsx` — `updateTravelerStatus` mutation

When status changes to `"approved"`, insert a notification for the traveler:
```typescript
// After successful status update, insert notification
const tp = travelerProfiles.find(t => t.id === id);
if (tp && status === "approved") {
  await supabase.from("notifications").insert({
    user_id: tp.profile_id,
    type: "traveler_approved",
    content: "Your traveler application has been approved! You can now view and claim parcels matching your routes."
  });
}
```

**Note**: The existing `notifications` INSERT RLS policy is RESTRICTIVE with no PERMISSIVE policy, so inserts will fail. A migration is needed to fix this (drop restrictive, add permissive):

```sql
DROP POLICY "Admins can insert notifications" ON notifications;
CREATE POLICY "Admins can insert notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

Similarly add a notification for rejection with appropriate messaging.

---

## 5. Sender Parcel Photo Upload

### `SmallParcelBooking.tsx`

Add a mandatory **"Parcel Photo"** upload field to the booking form:
- File input accepting JPEG/PNG (max 5MB)
- Required validation: `parcelPhotoName: z.string().min(1, "Please upload a photo of your parcel")`
- On submission, upload the file via the existing `upload-document` edge function or directly to storage, then store the URL in the `photo_url` column of the `parcels` table insert

The photo will be stored in the existing `documents` storage bucket under `{userId}/parcel-photo-{timestamp}.{ext}`.

---

## Files Modified

| File | Change |
|---|---|
| New migration SQL | Add 3 columns to `traveler_profiles`; fix notifications INSERT RLS |
| `src/components/CarrierRegistrationForm/types.ts` | Add 3 new upload fields |
| `src/components/CarrierRegistrationForm/Step3Vehicle.tsx` | Add 3 upload boxes |
| `src/components/CarrierRegistrationForm/index.tsx` | Append 3 files to FormData |
| `supabase/functions/register-traveler/index.ts` | Handle 3 new file uploads |
| `src/pages/AdminDashboard.tsx` | Show new docs in TravelerSheet; send notification on approval |
| `src/pages/SmallParcelBooking.tsx` | Add mandatory parcel photo upload |

