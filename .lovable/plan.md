

# Plan: Inline Document Viewer for Admin + iPhone Geolocation Help

## Problem 1: Traveler documents not visually viewable

The `DocumentLink` component renders documents as plain text links ("View Document → external tab"). For image-based documents (vehicle photo, license disk, proof of residence, ID copy, license copy), the admin wants to see inline thumbnails with click-to-fullscreen — the same pattern used by `ProofPhoto` for collection/delivery proof photos.

## Problem 2: iPhone geolocation permission confusion

When `getCurrentPosition` fails on iOS Safari, the error message is a generic string. Users need guidance on how to enable location access in iOS Settings.

---

## Changes

### 1. Replace `DocumentLink` with `DocumentPhoto` in TravelerSheet

Create a new `DocumentPhoto` component that:
- Takes a `storagePath` and `label`
- Generates a signed URL from the `documents` bucket (same as `DocumentLink`)
- Renders an inline thumbnail image with click-to-fullscreen dialog (same pattern as `ProofPhoto`)
- Falls back to "View Document" link for PDFs (detected by `.pdf` extension)
- Shows "Not uploaded" when path is null

Replace the Documents section in `TravelerSheet` to use `DocumentPhoto` for all 5 document fields. This gives admins the same visual experience as the Evidence Gallery for collection/delivery proofs.

### 2. Add iOS location settings help to geolocation error handling

In `TravelerDashboard.tsx`, enhance both `handleTagLocation` and `handleTagCollectionLocation` error callbacks:
- When the error code is `1` (PERMISSION_DENIED), show a detailed help message with iOS-specific instructions: "On iPhone: Settings → Safari → Location → Allow. Then reload this page."
- Add a persistent info tooltip/note near the "Tag Location" buttons explaining that location access must be enabled in browser settings, specifically mentioning the iOS Safari path.

Import `Tooltip` components and add a small info icon (ℹ️) next to each geotag button that shows the iOS settings path on hover/tap.

---

## Files Modified

| File | Change |
|---|---|
| `src/pages/AdminDashboard.tsx` | Add `DocumentPhoto` component; replace `DocumentLink` usage in TravelerSheet Documents section with `DocumentPhoto` for image docs, keep `DocumentLink` for PDFs |
| `src/pages/TravelerDashboard.tsx` | Enhance geolocation error messages with iOS-specific instructions; add info tooltip near geotag buttons |

