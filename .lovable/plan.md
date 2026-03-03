

# Fix "My Parcels" vs "Accepted" Confusion for Travelers

## Problem

The nav menu has a "My Parcels" link going to `/sender-dashboard` which shows all parcels where the user is the `sender_id`. The Traveler Dashboard has an "Accepted" tab showing parcels the user is delivering (via matches). 

If a user is both a sender and traveler, and they send a parcel, it appears under "My Parcels". If they also accept someone else's parcel for delivery, that shows under "Accepted". These are different parcels -- but the naming "My Parcels" is ambiguous because a traveler might think "my parcels" means "parcels I'm carrying".

## Solution

Rename and clarify the navigation and page titles to make the distinction obvious:

### 1. Rename "My Parcels" to "Sent Parcels" in Navbar
**File: `src/components/Navbar.tsx`**
- Change the nav link label from "My Parcels" to "Sent Parcels"
- Change the icon to `Package` (sending context) to differentiate from the truck/delivery context

### 2. Update SenderDashboard page title
**File: `src/pages/SenderDashboard.tsx`**
- Change the `<h1>` from "My Parcels" to "Sent Parcels"
- Add a subtitle: "Parcels you've booked for delivery"

### 3. Update TravelerDashboard "Accepted" tab label
**File: `src/pages/TravelerDashboard.tsx`**
- Rename the "Accepted" tab to "Carrying" to make it clear these are parcels the traveler is delivering, not parcels they sent
- Add a small helper text in the empty state: "Parcels you've accepted to deliver will appear here"

### Files Modified
- `src/components/Navbar.tsx` -- rename "My Parcels" to "Sent Parcels"
- `src/pages/SenderDashboard.tsx` -- update page title and add subtitle
- `src/pages/TravelerDashboard.tsx` -- rename "Accepted" tab to "Carrying"

