# Parcolo — Deployment & Operations Guide

## Architecture Overview

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Vite SPA   │────▶│  Supabase Edge   │────▶│  PostgreSQL │
│  (Lovable)  │     │  Functions       │     │  + RLS      │
└─────────────┘     └──────────────────┘     └─────────────┘
       │                                            │
       ▼                                            ▼
  Mapbox GL JS                               Supabase Storage
  (maps/geocoding)                           (document uploads)
```

- **Frontend**: React 18 + Vite, hosted on Lovable (or any static host)
- **Backend**: Supabase (Postgres, Edge Functions, Auth, Storage)
- **Payments**: Yoco (via Edge Functions + webhooks)
- **Maps**: Mapbox GL JS (public token embedded)

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18 | Build toolchain |
| npm | ≥ 9 | Package management |
| Supabase CLI | latest | DB migrations & Edge Functions |
| Git | any | Version control |

---

## Local Development Setup

```bash
# 1. Clone the repo
git clone <YOUR_GIT_URL> && cd parcolo

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Fill in your Supabase project values (see Environment Variables below)

# 4. Start dev server
npm run dev
# App runs at http://localhost:8080
```

---

## Environment Variables

### Frontend (`.env` — VITE_ prefixed)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_PROJECT_ID` | ✅ | Supabase project ref (e.g. `jlhyoqfsyadxvuhfesmc`) |
| `VITE_SUPABASE_URL` | ✅ | Full Supabase URL (`https://<ref>.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase anon/public key |
| `VITE_APP_URL` | ❌ | Production domain (falls back to `window.location.origin`) |

### Edge Function Secrets (set in Supabase Dashboard → Settings → Functions)

| Secret | Required | Description |
|--------|----------|-------------|
| `SUPABASE_URL` | auto | Injected by Supabase runtime |
| `SUPABASE_ANON_KEY` | auto | Injected by Supabase runtime |
| `SUPABASE_SERVICE_ROLE_KEY` | auto | Injected by Supabase runtime |
| `YOCO_SECRET_KEY` | ✅ | Yoco payment gateway secret key |
| `LOVABLE_API_KEY` | ✅ | Lovable platform API key |

> ⚠️ Never commit `.env` to version control. The `.gitignore` already excludes it.

---

## Database Migrations

Migrations live in `supabase/migrations/` and are managed by Lovable + Supabase CLI.

```bash
# Apply pending migrations to a linked project
supabase db push

# Create a new migration manually
supabase migration new <name>

# Check migration status
supabase migration list
```

**In Lovable**: Migrations are applied automatically when you accept schema changes in the editor. Published deploys push schema changes to the live environment.

---

## Edge Functions

Edge Functions live in `supabase/functions/<function-name>/index.ts`. Configuration is in `supabase/config.toml`.

| Function | Purpose |
|----------|---------|
| `register-sender` | Sender profile creation |
| `register-traveler` | Traveler profile + vehicle registration |
| `find-matching-trips` | Match parcels to available trips |
| `find-matching-parcels` | Match trips to pending parcels |
| `accept-match` | Traveler accepts a parcel match |
| `claim-parcel` | Traveler claims a specific parcel |
| `process-parcel-payment` | Initiates Yoco checkout |
| `yoco-parcel-webhook` | Handles Yoco payment callbacks |
| `submit-delivery-proof` | Upload delivery photo + geotag |
| `submit-collection-proof` | Upload collection photo + geotag |
| `verify-delivery` | Sender verifies delivery received |
| `approve-delivery` | Admin approves delivery |
| `cancel-accepted-match` | Cancel a previously accepted match |
| `cancel-parcel-by-sender` | Sender cancels their parcel |
| `reassign-parcel` | Reassign parcel to different traveler |
| `check-earlier-traveler` | Check for earlier trip matches |
| `delete-parcels` | Batch delete parcels (admin) |
| `upload-document` | Upload ID/license docs to storage |
| `log-frontend-error` | Log client-side errors to DB |
| `register-yoco-webhook` | Register webhook URL with Yoco |

**Deployment**: Edge Functions deploy automatically when code is pushed via Lovable or Git.

```bash
# Manual deploy (if needed)
supabase functions deploy <function-name>

# Deploy all
supabase functions deploy
```

---

## Deploying to Production

### Via Lovable (recommended)

1. Make changes in the Lovable editor
2. Click **Publish** (top-right) → **Update**
3. Frontend deploys to `parcolo.lovable.app`
4. Edge Functions and migrations deploy automatically

### Via Git (self-host)

```bash
# Build the frontend
npm run build

# Output is in dist/ — deploy to any static host:
# Netlify, Vercel, Cloudflare Pages, S3+CloudFront, etc.
```

Ensure your hosting provider sets these headers:
- `Content-Security-Policy` appropriate for your domain
- SPA fallback: all routes → `index.html`

---

## Custom Domain

1. In Lovable: Project → Settings → Domains → Connect Domain
2. Add a CNAME record pointing to Lovable's servers
3. SSL is provisioned automatically

Current production domain: `parcolo.com`

---

## Testing

```bash
# Run frontend unit tests
npx vitest run

# Run with watch mode
npx vitest

# Run edge function tests
npx supabase functions test log-frontend-error
```

Key test files:
- `src/config/pricingCalculator.test.ts` — pricing engine (33 tests)
- `src/lib/utils.test.ts` — utility functions
- `supabase/functions/log-frontend-error/index.test.ts` — edge function validation

---

## Monitoring & Troubleshooting

| What | Where |
|------|-------|
| Edge Function logs | [Supabase Dashboard → Functions](https://supabase.com/dashboard/project/jlhyoqfsyadxvuhfesmc/functions) |
| Client errors | `error_logs` table in Supabase |
| Auth issues | [Supabase Auth → Users](https://supabase.com/dashboard/project/jlhyoqfsyadxvuhfesmc/auth/users) |
| Payment issues | `payment_records` table + Yoco dashboard |
| App metrics | `app_metrics` table (signup, parcel, delivery counts) |

---

## Common Issues

| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank page on load | Missing env vars | Check browser console; run `validateEnv()` output |
| 401 on API calls | Expired/wrong anon key | Verify `VITE_SUPABASE_PUBLISHABLE_KEY` |
| Edge function 500 | Missing secret | Check Supabase Dashboard → Settings → Functions |
| Map not loading | Token issue | Mapbox public token is embedded; check console for 403 |
| Payment redirect fails | Wrong `APP_URL` | Set `APP_URL` secret in Edge Function settings |
