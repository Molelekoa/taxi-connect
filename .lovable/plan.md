

# Homepage CTA Improvements and Cross-Border Tabs

## Overview
Simplify the homepage to give users two clear paths -- sending a parcel or joining as a traveler -- and rework the cross-border section with tabbed navigation for each destination.

## Changes

### 1. Hero Section -- Two Clear CTAs (File: `src/pages/Index.tsx`)

Replace the current "Send a Parcel" and "Check Pricing" buttons with:
- **"I want to send a parcel"** -- Coral button, links to `/freight-estimator`
- **"I'm traveling soon"** -- Teal/primary outline button, links to `/carrier-signup`

Remove the "Check Pricing" button to reduce clutter. The sub-text "Create a free account to book -- pricing is always free to check" stays to reassure users.

### 2. Traveler CTA Strip (File: `src/pages/Index.tsx`)

Add a new lightweight section between the "How It Works" and "Cross-Border" sections with:
- Heading: **"Earn on Your Trips"**
- Short copy: "Already traveling between cities? Carry parcels on your route and earn extra income."
- CTA button: **"Sign Up as a Traveler"** (primary variant), linking to `/carrier-signup`

This is a simple, focused strip -- not a full benefits section (that lives on the carrier-signup page).

### 3. Cross-Border Section Rework with Tabs (File: `src/pages/Index.tsx`)

Replace the current static cross-border card with a tabbed interface using the existing Radix `Tabs` component:
- Three tabs: **"Send to Zimbabwe"**, **"Send to Lesotho"**, **"Send from South Africa"**
- Each tab shows: a short description, starting price, and a CTA button linking to `/freight-estimator`
- Tab content data:
  - **Zimbabwe**: From R525, popular routes like JHB to Harare/Bulawayo
  - **Lesotho**: From R150, routes like Bloemfontein to Maseru
  - **South Africa**: Domestic routes, from R80
- Keep the gradient background card styling but remove the large flag emojis

### 4. Community Strip CTA (File: `src/components/CommunityStrip.tsx`)

Add a "Join the Community" button (coral variant) below the scrolling avatars, linking to `/carrier-signup`.

## Technical Details

- Import `Tabs, TabsList, TabsTrigger, TabsContent` from `@/components/ui/tabs` in Index.tsx
- Import `Plane` icon from lucide-react for the traveler strip
- Add `useState` for active cross-border tab (or let Radix handle it with `defaultValue`)
- All links use existing routes -- no new pages needed
- No new dependencies required

