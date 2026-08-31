-- Payout system (manual EFT MVP) for Parcolo.
-- 1. Add banking detail columns to traveler_profiles so admins can pay verified travelers.
-- 2. Create a `payouts` table to track disbursements per approved delivery.

ALTER TABLE public.traveler_profiles
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_holder TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
  ADD COLUMN IF NOT EXISTS bank_branch_code TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_type TEXT; -- e.g. 'savings' | 'cheque' | 'international'

-- Payouts: one row per approved (verified) delivery that should be paid to the traveler.
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  parcel_id UUID REFERENCES public.parcels(id) ON DELETE SET NULL,
  traveler_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payout_rate NUMERIC NOT NULL DEFAULT 0.65,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'voided')),
  notes TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id)
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Travelers can view their own payouts.
CREATE POLICY "Travelers can view their own payouts"
  ON public.payouts FOR SELECT
  TO authenticated
  USING (
    traveler_id = public.get_profile_id(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Only admins can modify payouts (create via edge function, update for marking paid).
CREATE POLICY "Admins can update payouts"
  ON public.payouts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_payouts_traveler_status ON public.payouts (traveler_id, status);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts (status);
