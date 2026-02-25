

# Declutter Navbar and Feature Logo Prominently

## Problem
The navbar feels cluttered with the logo image, brand text, animated backgrounds, and navigation all competing for attention in a small space.

## Solution
Remove the logo image from the navbar and place it prominently in the hero section of the homepage. The navbar keeps only the text-based brand identity ("PARCOLO / We Deliver Together") for a cleaner, more professional header.

## Changes

### 1. Navbar (`src/components/Navbar.tsx`)
- Remove the `<img>` tag for `parcolo-logo.png` from the logo area
- Keep the stacked text: bold "PARCOLO" (font-brand) and "We Deliver Together" tagline
- Keep all animated background elements (blobs, dotted path, stars, etc.) -- they add personality without competing once the image is gone
- Reduce visual weight so the navbar feels clean and navigational

### 2. Hero Section (`src/pages/Index.tsx`)
- Add the logo image prominently above the hero headline
- Display it at a larger size (e.g., `h-24` or `h-28`) so it becomes a focal point when users first land on the page
- Position it within the left column of the hero grid, above the "Community-powered delivery" pill badge

### 3. Footer (`src/components/Footer.tsx`)
- Keep the logo in the footer as-is (it's appropriate there for brand reinforcement)

## Technical Details

| File | Change |
|------|--------|
| `src/components/Navbar.tsx` | Remove `<img>` tag on line 95; keep text-only brand mark |
| `src/pages/Index.tsx` | Add `<img src={parcoloLogo}>` in the hero section above the headline, sized prominently |

