

# Register Yoco Webhook Programmatically

## Context

Yoco requires webhook URLs to be registered via their API (`POST https://payments.yoco.com/api/webhooks`), not through a settings page. We need to create an Edge Function that registers our webhook endpoint with Yoco.

## Plan

### 1. Create Edge Function: `register-yoco-webhook`

**File:** `supabase/functions/register-yoco-webhook/index.ts`

- Admin-only utility function (called once to register, or on-demand)
- Makes a `POST` request to `https://payments.yoco.com/api/webhooks` with:
  - `Authorization: Bearer ${YOCO_SECRET_KEY}`
  - Body: `{ "name": "parcolo-parcel-payments", "url": "https://jlhyoqfsyadxvuhfesmc.supabase.co/functions/v1/yoco-parcel-webhook" }`
- Returns the Yoco response (webhook ID, status)

### 2. Update `supabase/config.toml`

- Add `[functions.register-yoco-webhook]` with `verify_jwt = false` (so it can be invoked easily, though we'll protect it with a check inside)

### 3. Invoke the function

After deployment, I will use the `supabase--curl_edge_functions` tool to call the function once, which will register the webhook URL with Yoco. This is a one-time setup step.

## Notes

- The `YOCO_SECRET_KEY` is already configured as a Supabase secret
- The webhook endpoint `yoco-parcel-webhook` is already deployed and ready to receive events
- This registration only needs to happen once — after that, Yoco will send events to our endpoint automatically

