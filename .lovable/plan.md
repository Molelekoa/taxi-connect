

# Rework Homepage Copy for Clarity and Incentives

## Overview
Sharpen the homepage copy to clearly communicate what's in it for both senders and travelers, keeping text short and punchy for short attention spans.

## Changes (File: `src/pages/Index.tsx`)

### 1. Hero Sub-copy (lines 117-123)
Replace the current paragraph with a shorter, punchier two-line message:

**Current:** "Send parcels across South Africa, Lesotho and Zimbabwe with verified travelers already on your route. No warehouses, no middlemen."

**New:** "Send parcels across South Africa, Lesotho and Zimbabwe -- up to 60% cheaper than couriers. Verified travelers deliver on routes they're already taking."

This keeps the geographic scope, adds the price incentive upfront, and explains the model in one breath.

### 2. "Why Parcolo?" Value Props (lines 232-280)
Rework the three cards to speak directly to sender benefits with sharper copy:

- **Save Up to 60%** (was "Affordable"): "No warehouses or fleet costs -- just smart route-sharing that passes savings to you."
- **Door-to-Door Coverage** (was "Wide Coverage"): "From Joburg to Harare, Maseru to Cape Town -- 3 countries, hundreds of routes."
- **Fast and Tracked** (was "Fast and Reliable"): "Daily departures. SMS updates. ID-verified collection on arrival."

### 3. Traveler CTA Strip (lines 428-458)
Rework the "Earn on Your Trips" section with concrete incentives:

- **Heading:** "Earn While You Travel"
- **Copy:** "Already driving between cities? Carry parcels and earn R50-R200+ per trip to offset your petrol and tolls. No commitment -- deliver when it suits you."

This adds a tangible earning range and the "no commitment" reassurance.

### 4. "How It Works" Step Descriptions (lines 361-408)
Tighten each step description:

- **Book and Pay:** "Choose your route, pay securely online -- a traveler heading your way picks up the parcel."
- **Traveler Delivers:** "A verified community member carries your parcel on a trip they're already making."
- **Recipient Collects:** "SMS notification on arrival. Show ID, collect your parcel -- done."

### 5. Cross-Border Tab Descriptions (lines 489-532)
Add brief value hooks to each tab:

- **Zimbabwe:** Add "Delivered by travelers on daily JHB-Harare routes."
- **Lesotho:** Add "Affordable cross-border delivery on established routes."
- **South Africa:** Add "City-to-city delivery without the courier markup."

## Technical Details
- All changes are copy-only edits within `src/pages/Index.tsx`
- No structural, layout, or component changes
- No new imports or dependencies needed

