-- Add new document columns to traveler_profiles
ALTER TABLE traveler_profiles
  ADD COLUMN IF NOT EXISTS vehicle_photo_url text,
  ADD COLUMN IF NOT EXISTS license_disk_url text,
  ADD COLUMN IF NOT EXISTS proof_of_residence_url text;

-- Fix notifications INSERT RLS: drop RESTRICTIVE policy, create PERMISSIVE one
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
CREATE POLICY "Admins can insert notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));