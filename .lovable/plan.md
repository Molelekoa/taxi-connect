

# Fix: How It Works Page Scroll Position

## Problem
When clicking "Learn More" to navigate to the How It Works page (`/how-it-works`), the page loads scrolled to the bottom instead of starting at the top (Step 01 - Book and Pay). This is because React Router preserves scroll position between route changes.

## Solution
Add a scroll-to-top effect when the How It Works page mounts, matching the same pattern already used on the Small Parcel Booking page.

## Changes

### File: `src/pages/HowItWorks.tsx`
- Import `useEffect` from React
- Add a `useEffect` hook that scrolls the window to the top on mount:
  ```ts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  ```

This is a single-line fix following the existing scroll-to-top pattern already established in the codebase.
