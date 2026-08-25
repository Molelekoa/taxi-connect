-- ============================================================
-- Production hardening migration
-- 1. Adds parcels.distance_km so prices can be recomputed
--    server-side at payment time (anti price-tampering).
-- 2. Data-integrity CHECK constraints (NOT VALID so they apply
--    to new rows without a full table scan / lock risk).
-- 3. quote_requests table for the public freight-quote form.
--    Intentionally NO RLS policies: only the service role
--    (edge functions) may read/write it.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Distance column used by process-parcel-payment to
--    recompute the authoritative price.
-- ------------------------------------------------------------
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS distance_km NUMERIC;

-- ------------------------------------------------------------
-- 2. Integrity constraints on monetary / weight columns.
--    NULLs are allowed (columns are nullable); constraints
--    only reject impossible non-null values.
-- ------------------------------------------------------------
ALTER TABLE public.parcels ADD CONSTRAINT parcels_price_non_negative
  CHECK (price IS NULL OR price >= 0) NOT VALID;

ALTER TABLE public.parcels ADD CONSTRAINT parcels_calculated_price_non_negative
  CHECK (calculated_price IS NULL OR calculated_price >= 0) NOT VALID;

ALTER TABLE public.parcels ADD CONSTRAINT parcels_weight_kg_range
  CHECK (weight_kg IS NULL OR weight_kg BETWEEN 0 AND 50) NOT VALID;

ALTER TABLE public.parcels ADD CONSTRAINT parcels_distance_km_range
  CHECK (distance_km IS NULL OR distance_km >= 0) NOT VALID;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'parcels_payment_status_valid'
  ) THEN
    ALTER TABLE public.parcels ADD CONSTRAINT parcels_payment_status_valid
      CHECK (payment_status IS NULL OR payment_status IN ('unpaid', 'pending', 'paid', 'refunded', 'failed')) NOT VALID;
  END IF;
END $$;

-- ------------------------------------------------------------
-- 3. Quote requests from the public freight-quote form.
--    Written exclusively by the submit-quote-request edge
--    function using the service role, so no policies are
--    created (deny-by-default under RLS).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  load_description TEXT NOT NULL,
  shipment_type TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_date DATE,
  pickup_location_type TEXT,
  delivery_address TEXT NOT NULL,
  delivery_date DATE,
  delivery_location_type TEXT,
  weight TEXT NOT NULL,
  dimensions TEXT,
  pallet_count TEXT,
  commodity_class TEXT,
  stackable TEXT,
  liftgate_required TEXT,
  hazmat BOOLEAN DEFAULT FALSE,
  hazmat_un TEXT,
  hazmat_class TEXT,
  temp_controlled BOOLEAN DEFAULT FALSE,
  temp_range TEXT,
  international BOOLEAN DEFAULT FALSE,
  countries TEXT,
  customs_clearance BOOLEAN DEFAULT FALSE,
  additional_insurance BOOLEAN DEFAULT FALSE,
  insurance_coverage TEXT,
  special_instructions TEXT,
  reference_numbers TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_quote_requests_email_created
  ON public.quote_requests (email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at
  ON public.quote_requests (created_at DESC);
