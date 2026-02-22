
-- 1. DELETE policy for profiles (owner + admin)
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 2. DELETE policy for traveler_profiles (owner + admin)
CREATE POLICY "Users can delete their traveler profile"
  ON public.traveler_profiles FOR DELETE
  TO authenticated
  USING (public.owns_traveler_profile(id) OR public.has_role(auth.uid(), 'admin'));

-- 3. DELETE policy for parcels (sender pending + admin)
CREATE POLICY "Senders can delete pending parcels"
  ON public.parcels FOR DELETE
  TO authenticated
  USING (
    (sender_id = public.get_profile_id(auth.uid()) AND status = 'pending')
    OR public.has_role(auth.uid(), 'admin')
  );

-- 4. DELETE policy for user_roles (admin only)
CREATE POLICY "Admins can delete role assignments"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Storage UPDATE policy for documents
CREATE POLICY "Users can update their own documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. Storage DELETE policy for users
CREATE POLICY "Users can delete their own documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 7. Storage DELETE policy for admins
CREATE POLICY "Admins can delete any documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.has_role(auth.uid(), 'admin')
  );
