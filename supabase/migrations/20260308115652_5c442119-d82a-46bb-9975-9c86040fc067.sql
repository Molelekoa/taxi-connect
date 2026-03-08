
-- Payment records table
CREATE TABLE public.payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  parcel_id uuid REFERENCES public.parcels(id),
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'ZAR',
  status text NOT NULL DEFAULT 'pending',
  payment_type text NOT NULL DEFAULT 'parcel',
  yoco_checkout_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own payment records or admins can view all
CREATE POLICY "Users can view own payments" ON public.payment_records
  FOR SELECT TO authenticated
  USING (user_id = get_profile_id(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Users can insert their own payment records
CREATE POLICY "Users can insert own payments" ON public.payment_records
  FOR INSERT TO authenticated
  WITH CHECK (user_id = get_profile_id(auth.uid()));

-- Service role / webhook can update payment records (use permissive for service role updates)
CREATE POLICY "Admins can update payments" ON public.payment_records
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add payment columns to parcels
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid';
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS payment_record_id uuid REFERENCES public.payment_records(id);
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS calculated_price numeric;
