
-- 1. Drop the overly-permissive SELECT policy for pending parcels
DROP POLICY IF EXISTS "Approved travelers can view pending parcels" ON public.parcels;

-- 2. Create a SECURITY DEFINER function that returns pending parcels
--    with sensitive fields stripped (for browsing by approved travelers)
CREATE OR REPLACE FUNCTION public.browse_pending_parcels()
RETURNS TABLE (
  id uuid,
  pickup_location text,
  dropoff_location text,
  weight_kg numeric,
  weight_band text,
  price numeric,
  description text,
  dimensions text,
  pickup_earliest date,
  pickup_latest date,
  status text,
  created_at timestamptz,
  include_tracking boolean,
  suburb text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id, p.pickup_location, p.dropoff_location, p.weight_kg, p.weight_band,
    p.price, p.description, p.dimensions, p.pickup_earliest, p.pickup_latest,
    p.status, p.created_at, p.include_tracking, p.suburb
  FROM public.parcels p
  WHERE p.status = 'pending'
    AND EXISTS (
      SELECT 1 FROM public.traveler_profiles tp
      WHERE tp.profile_id = get_profile_id(auth.uid())
        AND tp.status = 'approved'
    )
$$;
