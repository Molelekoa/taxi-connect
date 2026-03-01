
-- Add status column to traveler_profiles
ALTER TABLE public.traveler_profiles
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Re-create triggers (drop first to avoid conflict)
DROP TRIGGER IF EXISTS after_parcel_insert ON public.parcels;
CREATE TRIGGER after_parcel_insert
  AFTER INSERT ON public.parcels
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_parcel();

DROP TRIGGER IF EXISTS after_trip_insert ON public.trips;
CREATE TRIGGER after_trip_insert
  AFTER INSERT ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_trip();

-- Allow parcels to be read by approved travelers (for browsing)
CREATE POLICY "Approved travelers can view pending parcels"
  ON public.parcels FOR SELECT TO authenticated
  USING (
    status = 'pending' AND EXISTS (
      SELECT 1 FROM public.traveler_profiles tp
      WHERE tp.profile_id = get_profile_id(auth.uid())
        AND tp.status = 'approved'
    )
  );
