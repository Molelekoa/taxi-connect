
-- 1. Add new columns to parcels
ALTER TABLE public.parcels
  ADD COLUMN IF NOT EXISTS suburb text,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

-- 2. Drop existing CHECK constraint on status and recreate with 'cancelled'
ALTER TABLE public.parcels DROP CONSTRAINT IF EXISTS parcels_status_check;
ALTER TABLE public.parcels ADD CONSTRAINT parcels_status_check
  CHECK (status IN ('available','pending','matched','collected','in_transit','delivered_pending_verification','delivered_verified','delivered','cancelled'));

-- 3. Create cancellations table
CREATE TABLE IF NOT EXISTS public.cancellations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id uuid NOT NULL REFERENCES public.parcels(id) ON DELETE CASCADE,
  traveler_id uuid REFERENCES public.profiles(id),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Enable RLS on cancellations
ALTER TABLE public.cancellations ENABLE ROW LEVEL SECURITY;

-- 5. Admin-only SELECT policy
CREATE POLICY "Admins can view cancellations"
  ON public.cancellations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Add collection proof columns to parcels
ALTER TABLE public.parcels
  ADD COLUMN IF NOT EXISTS collection_photo_url text,
  ADD COLUMN IF NOT EXISTS collection_lat numeric,
  ADD COLUMN IF NOT EXISTS collection_lng numeric,
  ADD COLUMN IF NOT EXISTS collected_at timestamptz;
