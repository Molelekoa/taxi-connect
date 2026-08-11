-- Fix cancellations RLS policy
-- 1. Drop the existing overly-broad admin SELECT policy
DROP POLICY IF EXISTS "Admins can view cancellations" ON public.cancellations;

-- 2. Recreate it scoped to authenticated users only
CREATE POLICY "Admins can view cancellations"
  ON public.cancellations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Allow involved parties to view their own cancellation records
CREATE POLICY "Involved parties can view cancellations"
  ON public.cancellations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parcels p
      WHERE p.id = parcel_id
        AND (
          p.sender_id = public.get_profile_id(auth.uid())
          OR p.traveler_id = public.get_profile_id(auth.uid())
        )
    )
  );