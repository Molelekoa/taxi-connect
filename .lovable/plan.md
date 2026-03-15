

## Mobile Scrolling Optimization Plan

### Problems Identified

1. **LocationInput dropdown** — The city picker dropdown (`max-h-48 overflow-y-auto`) has no visible scrollbar on mobile and poor touch scrolling. Users can't tell there are more options or easily scroll through them.

2. **Homepage hero locks the viewport** — The hero section uses `h-screen`, filling the entire mobile screen. There's no visual cue that more content exists below (stats strip, How It Works, Cross-Border, etc.).

3. **General touch scrolling** — Several pages with long content (HowItWorks, SmallParcelBooking, FAQ, Terms, Privacy) lack momentum scrolling hints on mobile.

### Changes

#### 1. LocationInput — Better mobile dropdown (`src/components/LocationInput.tsx`)
- Increase touch target size for suggestion buttons (min `py-3` on mobile)
- Add `-webkit-overflow-scrolling: touch` and visible scrollbar styling
- Show a subtle fade gradient at the bottom of the dropdown when there are more items to scroll to
- Add a small "N more cities" indicator at the bottom when list is truncated by the scroll area

#### 2. Homepage hero — Scroll cue (`src/pages/Index.tsx`)
- Remove the hard `h-screen` constraint; change to `min-h-[85vh]` so on mobile the stats strip peeks above the fold
- Add an animated "scroll down" chevron indicator at the bottom of the hero that bounces gently, disappearing once user scrolls

#### 3. Global mobile scroll improvements (`src/index.css`)
- Add `overscroll-behavior-y: contain` on the body to prevent pull-to-refresh interference in WebView
- Add a utility class for visible mobile scrollbars (thin, styled) that can be applied to any scrollable container
- Ensure `scroll-behavior: smooth` is respected but doesn't block momentum scrolling

#### 4. HowItWorks page scroll awareness (`src/pages/HowItWorks.tsx`)
- The page content is fine structurally, but the `pt-24 pb-16` padding plus card heights can make it feel stuck on small screens. Add a subtle scroll indicator after the hero section on mobile.

### Files to modify
- `src/components/LocationInput.tsx` — larger touch targets, visible scroll indicator, fade hint
- `src/pages/Index.tsx` — `min-h-[85vh]` instead of `h-screen`, add scroll-down chevron
- `src/index.css` — mobile scrollbar utility, overscroll containment
- `src/pages/HowItWorks.tsx` — minor spacing adjustment for mobile scroll flow

