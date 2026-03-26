

# Revised Plan: Driver Waitlist with Admin Full Access

## The Question
Should the admin be able to browse the full platform while `PUBLIC_LAUNCHED=false`, or only see the waitlist + admin dashboard?

## Recommended Approach
Give the admin **full platform access** even when the gate is off. This lets you continue testing, editing, and refining every page while the public only sees the waitlist.

## How It Works

```text
VITE_PUBLIC_LAUNCHED=false
  Visitors (not logged in):
    / → DriverWaitlist
    * → Redirect to /

  Admin (logged in + admin role):
    / → DriverWaitlist (or Index — your choice)
    /admin → AdminDashboard (with Waitlist tab)
    /sender-dashboard, /traveler-dashboard, etc. → ALL accessible
    Every route works normally

VITE_PUBLIC_LAUNCHED=true
  Everyone sees the full platform as normal
```

## Implementation Detail

In `App.tsx`, the launch gate check wraps routes in a component that:
1. Checks `IS_LAUNCHED` — if `true`, render everything normally
2. If `false`, checks if the current user has the admin role via `useIsAdmin()`
3. If admin → render all routes normally
4. If not admin → render only `/`, `/auth`, and catch-all redirect to `/`

This means **you can browse every page, test every flow, and make changes** while the public sees only the waitlist.

## What You Get as Admin

| Capability | Available? |
|---|---|
| View full website (all pages) | Yes |
| Make changes and test flows | Yes |
| View driver waitlist signups | Yes (Admin Dashboard → Waitlist tab) |
| Mark drivers as "onboarded" | Yes |
| Filter signups by status | Yes |
| Access admin dashboard | Yes |
| Public sees the platform | No (only waitlist) |

## Files — same as original plan
| File | Change |
|---|---|
| `.env` | Add `VITE_PUBLIC_LAUNCHED=false` |
| `src/config/launchGate.ts` | New — export `IS_LAUNCHED` boolean |
| `src/pages/DriverWaitlist.tsx` | New — waitlist landing page with signup form |
| `src/pages/AdminDashboard.tsx` | Add "Waitlist" tab |
| `src/App.tsx` | Launch gate logic: admin gets full access, public gets waitlist only |
| Migration | New `driver_waitlist` table with RLS |

## Toggling to Launch
When you're ready to go live, change `VITE_PUBLIC_LAUNCHED=true` in your environment variables. The waitlist page stays accessible at a dedicated route if you want to keep it, but the full platform becomes public.

