

## Fix Booking Confirmation Screen

### Changes

**File: `src/pages/SmallParcelBooking.tsx`**

1. **Remove the "Confirm Delivery Received" button and rating flow from the success screen** -- this doesn't belong on the booking confirmation since the parcel hasn't been delivered yet. The `showDeliveryRating` state and the button/rating section (lines 325-344) will be removed entirely.

2. **Update the confirmation message** (line 299-301): Replace "We'll contact you within **1 hour** to confirm pickup details." with "We'll contact you soon to confirm pickup details." -- removing the specific time frame.

3. **Update the toast message** (line 256): Change "We'll confirm your parcel pickup within 1 hour." to "We'll contact you soon to confirm pickup details."

4. **Clean up unused state**: Remove the `showDeliveryRating` state variable (line 116) and the `DeliveryRating` import (line 5) since they're no longer used on this page. Also remove `setShowDeliveryRating(false)` from the "Book Another Parcel" button (line 347).

### What stays
- The "What happens next?" steps section remains
- The "Book Another Parcel" and "Return Home" buttons remain
- The `DeliveryRating` component file itself is kept for future use when delivery tracking is built

