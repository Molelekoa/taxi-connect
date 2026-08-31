# Lovable Deploy Prompt — Payout System Migrations + Edge Functions

Copy and paste the block below into Lovable, **in this order** (either as separate prompts run sequentially, or one combined prompt — the order matters so migrations run before functions that reference the new tables/columns).

---

## Prompt (use in this order)

### Step 1 — Apply migrations
Apply the following two SQL migrations to the Supabase production database (they are checked into `supabase/migrations/`, run them in this order):

1. `20260831000000_add_traveler_id_number.sql` — adds `id_number` and `passport_number` columns to `traveler_profiles`.
2. `20260831010000_add_payout_system.sql` — creates the `payouts` table (with a unique `match_id`), adds bank-detail columns to `traveler_profiles` (`bank_name`, `bank_account_holder`, `bank_account_number`, `bank_branch_code`, `bank_account_type`), sets the table's RLS policies, and adds an index on `traveler_id, status`.

Confirm each migration ran without errors before proceeding.

### Step 2 — Deploy edge functions
Deploy these edge functions (from `supabase/functions/`):
- `verify-delivery`
- `register-traveler`
- `upsert-bank-details`
- `list-payouts`
- `mark-payout-paid`

Optional: set the edge-function environment variable `PAYOUT_RATE` (defaults to `0.65` if not set).

Confirm each function deployed successfully and tell me once the schema and functions are live.

---

## Why this order
- Edge functions reference the `payouts` table and the new `traveler_profiles` columns, so the schema must exist first.
- Functions must be deployed after migrations so they operate against the live schema.
