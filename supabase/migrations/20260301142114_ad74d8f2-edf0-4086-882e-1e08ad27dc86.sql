-- Add 'matched' to parcels status constraint (drop old if exists, add new)
ALTER TABLE public.parcels DROP CONSTRAINT IF EXISTS parcels_status_check;
ALTER TABLE public.parcels ADD CONSTRAINT parcels_status_check CHECK (status IN ('pending', 'matched', 'collected', 'in-transit', 'delivered', 'cancelled'));

-- Allow users to delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (owns_profile(user_id));
