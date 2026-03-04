
-- Drop the existing RESTRICTIVE admin insert policy on notifications
DROP POLICY IF EXISTS "Admins can insert notifications" ON public.notifications;

-- Recreate as PERMISSIVE so admin inserts actually succeed
CREATE POLICY "Admins can insert notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
