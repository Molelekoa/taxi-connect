# Parcolo Market Readiness Assessment & Fix Plan

## Goal

Determine whether Parcolo is safe to launch for the public across South Africa, Lesotho, and Zimbabwe, and fix any launch-blocking issues. Produce a prioritized list of blockers and post-launch improvements.

## Current State (verified)

- The app is currently in **waitlist-only mode** (`VITE_PUBLIC_LAUNCHED=false`). Public visitors see only the driver waitlist; admins see the full platform.
- A published deployment exists at `parcolo.com` and a Lovable URL.
- Security scan (run 2026-08-11) shows **0 critical findings, 6 warnings**:
  - Several `SECURITY DEFINER` functions are executable by public/authenticated roles.
  - Leaked-password protection is disabled in Supabase Auth.
  - RLS warnings on `cancellations`, `matches`, and `trips` tables.
- Preview console logs show repeated `TypeError: Failed to fetch` from Supabase auth/API calls.
- An earlier unapproved plan exists for waitlist-page polish; the waitlist page already appears to include most of those changes.

## Phase 1: Diagnostic (read-only)

1. **Trace the preview fetch failures**
   - Inspect network requests and console logs to identify whether failures are auth-session related, edge-function CORS, realtime, or Supabase connectivity.
   - Reproduce on the published URL and the preview URL.

2. **Run build and tests**
   - Run `vite build` to catch TypeScript/compile errors.
   - Run the existing test suites (`pricingCalculator.test.ts`, `utils.test.ts`, edge-function tests).

3. **Review security warnings against intent**
   - Map each `SECURITY DEFINER` warning to an actual function and confirm whether public/authenticated execution is intentional.
   - Verify `cancellations`, `matches`, and `trips` policies match the documented privacy model.

4. **Audit critical user flows**
   - Sender: sign up → book parcel → pay → track → confirm delivery.
   - Traveler: sign up → submit documents → admin approval → claim parcel → collect proof → deliver proof → get paid.
   - Admin: review travelers, manage parcels, verify delivery proofs.

## Phase 2: Launch-Blocker Fixes

1. **Fix the fetch-failure root cause**
   - If it is an auth/session issue, fix the client setup or auth hook.
   - If it is an edge-function/CORS issue, update edge-function CORS and config.
   - If it is a missing/wrong environment variable, correct `.env` and secrets.

2. **Tighten RLS and policies**
   - Correct the `cancellations` admin policy role from `{public}` to `{authenticated}`.
   - Add sender/traveler SELECT on `cancellations` where appropriate.
   - Review `matches` INSERT/DELETE gap and `trips` SELECT policy against the matching engine requirements.

3. **Enable leaked-password protection**
   - Turn on leaked-password protection in Supabase Auth settings.

4. **Verify auth email flows**
   - Confirm sign-up confirmation, password reset, and branded auth emails send and link correctly.

## Phase 3: Full-Platform Launch Decision

1. **Recommend launch mode**
   - Waitlist-only: lower risk, collects drivers before opening bookings.
   - Full-platform: opens sender booking and traveler matching immediately.

2. **If full-platform launch is chosen**
   - Set `VITE_PUBLIC_LAUNCHED=true`.
   - Verify all public routes render and protect authenticated routes.
   - Re-run end-to-end booking and matching flows.

3. **If waitlist-only launch is chosen**
   - Keep `VITE_PUBLIC_LAUNCHED=false`.
   - Polish the waitlist page and ensure waitlist submissions reach the database reliably.

## Phase 4: Compliance & Polish

1. Verify Terms of Service and Privacy Policy content are current and region-appropriate.
2. Confirm cookie consent and any tracking comply with South African POPIA and general best practice.
3. Add or verify error boundaries, loading states, and offline behavior.
4. Run a final security scan and Supabase linter; ensure no new critical issues.

## Deliverables

- A clear **go / no-go / go-with-reservations** verdict.
- A prioritized **launch-blocker list** with owners and estimates.
- A **post-launch improvement backlog**.
- Updated deployment notes if any environment or secret changes are required.

## Technical Details

```text
Key files and resources to inspect during the assessment:
- src/App.tsx                  (routing and launch gate)
- src/config/launchGate.ts     (VITE_PUBLIC_LAUNCHED flag)
- src/contexts/AuthContext.tsx (session management)
- src/integrations/supabase/client.ts (Supabase client setup)
- supabase/config.toml         (edge function JWT verification)
- supabase/migrations/         (RLS policies and schema)
- .env                         (public Supabase and app URL config)
- Supabase Auth settings       (leaked-password protection, email templates)
- Edge Function logs           (process-parcel-payment, yoco-parcel-webhook, register-*)
```
