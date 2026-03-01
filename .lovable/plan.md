

# Uber-Style Homepage Redesign

## Overview
Transform the homepage from a content-heavy marketing page into a clean, app-like experience where the quote/booking flow is front-and-center. Think Uber: open the app, see the map, book immediately. All supporting content moves behind a pulsing hamburger menu.

## Changes

### 1. Simplified Navbar with Pulsing Hamburger (File: `src/components/Navbar.tsx`)

Strip the navbar down to just:
- PARCOLO wordmark (left)
- Pulsing hamburger icon (right) -- always visible, desktop and mobile
- Remove all visible nav links, "Join the Community", "Get Quote", and user buttons from the top bar
- Remove all the animated background SVGs (blobs, dotted paths, parcel icons, stars, hearts)

The hamburger gets a subtle pulse animation (CSS ring pulse, like a notification dot) to draw attention. On click, it opens a full-screen or side-panel menu containing:
- "Send a Parcel" (links to `/freight-estimator`)
- "I'm Traveling Soon" (links to `/carrier-signup`)
- "How It Works" (links to `/how-it-works`)
- "FAQ" (links to `/faq`)
- Log In / Sign Out
- Admin (if admin)

### 2. App-Like Homepage (File: `src/pages/Index.tsx`)

Radically simplify the homepage to three visual layers:

**Layer 1 -- Hero (above the fold, full viewport height)**
- Clean headline: "Where are you sending?"
- Two large input fields (Origin and Destination) pulled from the FreightEstimator -- reuse `LocationInput`
- A prominent "Get Quote" coral button
- Below inputs: two secondary CTAs as text links -- "I'm a traveler -- earn on your trips" linking to `/carrier-signup`
- Background: the route map component (`RouteMap`) fills the hero area behind the form, giving it the Uber map feel

**Layer 2 -- Quick info strip (compact, no scroll needed)**
- Three inline stats: "60% cheaper" | "3 countries" | "Daily departures"
- Single row, no cards, no animations

**Layer 3 -- Scrollable content below (for those who want more)**
- Cross-border tabs (Zimbabwe, Lesotho, South Africa) -- kept but simplified
- "How It Works" -- condensed to a single horizontal row
- Community strip
- Footer

All the current sections (Value Props cards, Parcel Size Selector, Savings Counter animation, Traveler CTA strip, Stats section) are removed from the homepage. Their content lives on dedicated pages accessible via the hamburger menu.

### 3. Route Map in Hero Background (File: `src/pages/Index.tsx`)

Display a default RouteMap (showing South Africa centered) as the hero background. When the user types origin/destination, the map updates live -- just like Uber shows a map before you type your destination.

This reuses the existing `RouteMap` and `useMapboxDistance` hook, plus `LocationInput`.

### 4. Navigation Flow

When a user fills in origin + destination on the homepage and clicks "Get Quote", they navigate to `/freight-estimator` with the locations pre-filled via route state, where they complete the weight selection and see pricing -- keeping the estimator page as the full booking flow.

## Technical Details

### File: `src/components/Navbar.tsx`
- Remove all desktop nav links, CTA buttons, and animated SVG background elements
- Keep only logo + hamburger button (always visible)
- Add pulse animation CSS keyframe for the hamburger button
- Use the existing `Sheet` component (side panel) for the menu drawer
- Import `Sheet, SheetContent, SheetTrigger` from `@/components/ui/sheet`
- Menu items: Send a Parcel, I'm Traveling, How It Works, FAQ, Log In/Out, Admin

### File: `src/pages/Index.tsx`
- Remove: ParcelPassAnimation, SavingsCounter, HowItWorksIcons imports and sections
- Remove: Value Props section, Parcel Size Selector section, Traveler CTA strip, Stats section
- Add: `LocationInput` import, `useNavigate` for passing state to freight-estimator
- Add: `RouteMap` as background element in hero
- Add: Two `LocationInput` fields with local state for origin/destination
- Add: "Get Quote" button that navigates to `/freight-estimator` with `{ state: { pickupLocation, deliveryLocation } }`
- Keep: Cross-border tabs (simplified), Community strip, Footer
- Keep: `useEffect` scroll-to-top

### File: `src/pages/FreightEstimator.tsx`
- Add: Read `location.state` to pre-fill `pickupLocation` and `deliveryLocation` from homepage navigation
- Use `useLocation` from react-router-dom

### New CSS (in Navbar or index.css)
```css
@keyframes hamburger-pulse {
  0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4); }
  50% { box-shadow: 0 0 0 8px hsl(var(--primary) / 0); }
}
```

