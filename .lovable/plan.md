

# Yoco Payment Integration for Parcel Deliveries

## Prerequisites

**YOCO_SECRET_KEY is not configured.** Before implementation can begin, the Yoco secret key must be added as a Supabase Edge Function secret. You will need to:

1. Get your Yoco Secret Key from the [Yoco Developer Portal](https://developer.yoco.com/)
2. I will securely store it as a Supabase secret called `YOCO_SECRET_KEY`

---

## Database Changes (Migration)

Create a `payment_records` table and add payment columns to `parcels`:

```sql
-- Payment records table
CREATE TABLE public.payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  parcel_id uuid REFERENCES parcels(id),
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'ZAR',
  status text NOT NULL DEFAULT 'pending',
  payment_type text NOT NULL DEFAULT 'parcel',
  yoco_checkout_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Users can view/insert their own payment records
CREATE POLICY "Users can view own payments" ON public.payment_records
  FOR SELECT TO authenticated
  USING (user_id = get_profile_id(auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own payments" ON public.payment_records
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_profile_id(auth.uid()));

-- Admins can update payment records (for webhook updates)
CREATE POLICY "Admins can update payments" ON public.payment_records
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Add payment columns to parcels
ALTER TABLE public.parcels ADD COLUMN payment_status text DEFAULT 'unpaid';
ALTER TABLE public.parcels ADD COLUMN payment_record_id uuid REFERENCES payment_records(id);
ALTER TABLE public.parcels ADD COLUMN calculated_price numeric;
```

---

## Implementation Plan

### 1. Edge Function: `process-parcel-payment`

**File:** `supabase/functions/process-parcel-payment/index.ts`

- Authenticate user via JWT
- Validate input with Zod (amount, currency, parcelId, paymentRecordId)
- Call Yoco Checkout API: `POST https://payments.yoco.com/api/checkouts`
- Use `YOCO_SECRET_KEY` from secrets
- Set `successUrl` to `https://parcolo.com/parcel-payment-success?payment_id={CHECKOUT_ID}`
- Set `cancelUrl` to `https://parcolo.com/parcel-payment-cancelled`
- Include metadata: user_id, parcel_id, payment_record_id
- Return `redirectUrl` to frontend

### 2. Edge Function: `yoco-parcel-webhook`

**File:** `supabase/functions/yoco-parcel-webhook/index.ts`

- Public endpoint (no JWT required)
- On `checkout.completed` event:
  - Extract `payment_record_id` from metadata
  - Update `payment_records` status to `paid`, store `yoco_checkout_id`
  - Update `parcels.payment_status` to `paid`
  - Send in-app notification to sender: "Your payment for parcel #[id] has been confirmed. Your parcel is now available for travelers."

### 3. Hook: `useParcelPaymentHandler`

**File:** `src/hooks/useParcelPaymentHandler.ts`

- Accept parcel ID, amount, and user profile ID
- Insert a `payment_records` row with status `pending`
- Invoke `process-parcel-payment` edge function
- Redirect browser to Yoco's `redirectUrl`

### 4. Success Page: `/parcel-payment-success`

**File:** `src/pages/ParcelPaymentSuccess.tsx`

- Extract `payment_id` from URL query params
- Poll/check `payment_records` for status update
- Show success message with parcel details
- Button to go to Sender Dashboard

### 5. Modify Booking Flow in `SmallParcelBooking.tsx`

- After parcel insert, store the parcel ID and calculated price
- Replace the "Pay Now" toast placeholder (line 505) with actual Yoco redirect via `useParcelPaymentHandler`
- Store `calculated_price` in the parcels insert
- Set initial `payment_status = 'unpaid'` on insert

### 6. Payment Verification Card

**File:** `src/components/parcels/ParcelPaymentVerificationCard.tsx`

- Show on Sender Dashboard for parcels with `payment_status = 'pending'`
- Button to manually verify by calling the edge function to check Yoco status

### 7. Route Registration

**File:** `src/App.tsx`

- Add route `/parcel-payment-success` → `ParcelPaymentSuccess`
- Add route `/parcel-payment-cancelled` (redirect back to dashboard with message)

### 8. Config

**File:** `supabase/config.toml`

- Add `[functions.process-parcel-payment]` with `verify_jwt = false`
- Add `[functions.yoco-parcel-webhook]` with `verify_jwt = false`

---

## Flow Summary

```text
Sender fills form → calculates price → clicks "Pay Now"
    ↓
Insert parcel (payment_status=unpaid) + payment_record (status=pending)
    ↓
Call process-parcel-payment edge function
    ↓
Yoco Checkout API → returns redirectUrl
    ↓
Browser redirects to Yoco hosted checkout
    ↓
On success → /parcel-payment-success page
    ↓
Webhook fires → updates payment_record + parcel.payment_status = 'paid'
    ↓
Parcel now visible in traveler matching pool
```

---

## Security Notes

- YOCO_SECRET_KEY stored as Supabase secret, never exposed client-side
- Webhook endpoint validates event structure
- Payment records scoped by user via RLS
- Parcel matching only considers parcels with `payment_status = 'paid'` (update matching queries)

