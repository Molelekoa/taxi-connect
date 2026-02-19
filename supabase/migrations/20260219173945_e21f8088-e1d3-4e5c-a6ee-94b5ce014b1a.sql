
-- Fix: Allow travelers to update their assigned parcels (status only)
-- and allow senders to cancel their own pending parcels.
-- This resolves the overly-restrictive "Admins only" UPDATE policy.

-- Drop the existing admin-only update policy
DROP POLICY IF EXISTS "Admins can update parcels" ON public.parcels;

-- Admins retain full update access
CREATE POLICY "Admins can update any parcel"
  ON public.parcels FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Travelers assigned to a parcel can update status to collected/in-transit/delivered
CREATE POLICY "Travelers can update their assigned parcels"
  ON public.parcels FOR UPDATE
  TO authenticated
  USING (traveler_id = public.get_profile_id(auth.uid()))
  WITH CHECK (
    traveler_id = public.get_profile_id(auth.uid())
    AND status IN ('collected', 'in-transit', 'delivered')
  );

-- Senders can cancel (only status = 'pending' → status = 'pending' keeps it safe)
-- Senders can only touch their own pending parcels
CREATE POLICY "Senders can cancel their pending parcels"
  ON public.parcels FOR UPDATE
  TO authenticated
  USING (
    sender_id = public.get_profile_id(auth.uid())
    AND status = 'pending'
  )
  WITH CHECK (
    sender_id = public.get_profile_id(auth.uid())
    AND status = 'pending'
  );
