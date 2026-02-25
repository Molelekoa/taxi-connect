
Goal: make email signup/confirmation and password-reset redirects work reliably with your real domain (`https://parcolo.com`) and stop localhost/incorrect redirect behavior.

What I found in your code:
1. `src/pages/Auth.tsx` still uses runtime origin:
   - `emailRedirectTo: window.location.origin`
   - `redirectTo: \`${window.location.origin}/reset-password\``
2. Your current published app URL is still `https://parcolo.lovable.app` (I do not see `parcolo.com` as the active published URL from project URLs).
3. With current code, links are generated from whichever URL the user is currently on (preview, localhost, or published domain). That is why localhost can appear in emails if signup happened locally.

Most likely root cause now:
- You added `https://parcolo.com` in Supabase Redirect URLs, but one or more of these is still missing/misaligned:
  1) domain not fully connected/published in Lovable
  2) Supabase Site URL not set to `https://parcolo.com`
  3) missing additional allowlist entries (`www`, lovable published URL, preview URL, localhost for local tests)

What to do now (no code required for minimum fix):
1. In Lovable Domain settings:
   - Ensure `parcolo.com` is connected and Active
   - Set it as Primary domain
   - Publish/update frontend so production traffic uses that domain
2. In Supabase Auth URL configuration:
   - Site URL: `https://parcolo.com`
   - Redirect URLs allowlist add:
     - `https://parcolo.com/**`
     - `https://www.parcolo.com/**`
     - `https://parcolo.lovable.app/**` (until migration fully complete)
     - `https://id-preview--a570748e-1e7b-42e7-a8d6-2f5ce67e278a.lovable.app/**` (if testing in preview)
     - `http://localhost:8080/**` (if testing locally)
3. Retest end-to-end from the same domain you expect users to use in production (`https://parcolo.com`), not preview/localhost.

Do you need code changes?
- Strictly required: No, if all signups/password resets are done from `parcolo.com`.
- Strongly recommended: Yes, to make redirects deterministic and avoid future environment mismatches.

Recommended hardening code change (implementation plan):
1. Add a single app URL resolver in `src/pages/Auth.tsx`:
   - Use `VITE_APP_URL` when provided
   - Fallback to `window.location.origin` in development
2. Replace both redirect calls with that shared value:
   - signup `emailRedirectTo`
   - reset `redirectTo`
3. Add `VITE_APP_URL=https://parcolo.com` in production environment config.

Example target behavior:
- Production emails always point to `https://parcolo.com`
- Local/dev still works without manual toggling

Validation checklist after fix:
1. Sign up from `https://parcolo.com/auth`
2. Open confirmation email and confirm it lands on your domain (not localhost)
3. Log in successfully
4. Trigger “Forgot password” and verify reset link lands on `/reset-password` on the same domain
5. Repeat once from preview/localhost (only if those URLs are intentionally allowlisted)

Technical notes:
- File impacted for code hardening: `src/pages/Auth.tsx`
- No DB migrations needed.
- No edge function changes needed.
