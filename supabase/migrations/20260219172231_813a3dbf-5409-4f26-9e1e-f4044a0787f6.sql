
-- =============================================
-- ParcelBuddy Full Schema Migration
-- =============================================

-- 1. Enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. user_roles table (roles stored separately for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  physical_address TEXT,
  role TEXT CHECK (role IN ('traveler', 'sender')),
  id_document_url TEXT,
  legal_declaration_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. traveler_profiles table
CREATE TABLE public.traveler_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_type TEXT,
  years_with_license TEXT,
  no_criminal_record BOOLEAN,
  id_copy_url TEXT,
  license_copy_url TEXT,
  vehicle_ownership TEXT,
  vehicle_type TEXT,
  vehicle_registration TEXT,
  vehicle_year TEXT,
  vehicle_model TEXT,
  vehicle_colour TEXT,
  min_load_capacity TEXT,
  max_load_capacity TEXT,
  has_valid_insurance BOOLEAN,
  travel_frequency TEXT,
  schedule_type TEXT,
  available_days TEXT[],
  departure_time TEXT,
  advance_notice TEXT,
  parcels_per_trip TEXT,
  storage_type TEXT,
  cargo_types TEXT[],
  emergency_contact_name TEXT,
  emergency_contact_relation TEXT,
  emergency_contact_phone TEXT,
  referral_source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.traveler_profiles ENABLE ROW LEVEL SECURITY;

-- 5. traveler_routes table
CREATE TABLE public.traveler_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  traveler_profile_id UUID NOT NULL REFERENCES public.traveler_profiles(id) ON DELETE CASCADE,
  route_from TEXT,
  route_to TEXT,
  return_trip TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.traveler_routes ENABLE ROW LEVEL SECURITY;

-- 6. parcels table
CREATE TABLE public.parcels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  traveler_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  pickup_location TEXT,
  dropoff_location TEXT,
  weight_kg NUMERIC,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'in-transit', 'delivered')),
  price NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;

-- 7. delivery_ratings table
CREATE TABLE public.delivery_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID NOT NULL UNIQUE REFERENCES public.parcels(id) ON DELETE CASCADE,
  rated_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_ratings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Storage bucket for documents
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- =============================================
-- Helper functions (SECURITY DEFINER to avoid RLS recursion)
-- =============================================

-- Check if a user has a given role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get profile id from auth uid
CREATE OR REPLACE FUNCTION public.get_profile_id(_auth_uid UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE auth_id = _auth_uid LIMIT 1
$$;

-- Check if current user owns a profile row
CREATE OR REPLACE FUNCTION public.owns_profile(_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _profile_id AND auth_id = auth.uid()
  )
$$;

-- Check if current user owns a traveler profile (via profile chain)
CREATE OR REPLACE FUNCTION public.owns_traveler_profile(_tp_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.traveler_profiles tp
    JOIN public.profiles p ON p.id = tp.profile_id
    WHERE tp.id = _tp_id AND p.auth_id = auth.uid()
  )
$$;

-- =============================================
-- Auto-create profile trigger
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (auth_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parcels_updated_at
  BEFORE UPDATE ON public.parcels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- RLS Policies
-- =============================================

-- user_roles: admins can read all; users cannot read (prevents privilege escalation)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- traveler_profiles
CREATE POLICY "Users can view their own traveler profile"
  ON public.traveler_profiles FOR SELECT
  TO authenticated
  USING (public.owns_traveler_profile(id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own traveler profile"
  ON public.traveler_profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.owns_profile(profile_id));

CREATE POLICY "Users can update their own traveler profile"
  ON public.traveler_profiles FOR UPDATE
  TO authenticated
  USING (public.owns_traveler_profile(id) OR public.has_role(auth.uid(), 'admin'));

-- traveler_routes
CREATE POLICY "Users can view their own routes"
  ON public.traveler_routes FOR SELECT
  TO authenticated
  USING (public.owns_traveler_profile(traveler_profile_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own routes"
  ON public.traveler_routes FOR INSERT
  TO authenticated
  WITH CHECK (public.owns_traveler_profile(traveler_profile_id));

CREATE POLICY "Users can update their own routes"
  ON public.traveler_routes FOR UPDATE
  TO authenticated
  USING (public.owns_traveler_profile(traveler_profile_id) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own routes"
  ON public.traveler_routes FOR DELETE
  TO authenticated
  USING (public.owns_traveler_profile(traveler_profile_id) OR public.has_role(auth.uid(), 'admin'));

-- parcels
CREATE POLICY "Parcel parties can view parcels"
  ON public.parcels FOR SELECT
  TO authenticated
  USING (
    sender_id = public.get_profile_id(auth.uid())
    OR traveler_id = public.get_profile_id(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Senders can insert parcels"
  ON public.parcels FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = public.get_profile_id(auth.uid()));

CREATE POLICY "Admins can update parcels"
  ON public.parcels FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- delivery_ratings
CREATE POLICY "Related parties can view ratings"
  ON public.delivery_ratings FOR SELECT
  TO authenticated
  USING (
    rated_by = public.get_profile_id(auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Users can insert their own ratings"
  ON public.delivery_ratings FOR INSERT
  TO authenticated
  WITH CHECK (rated_by = public.get_profile_id(auth.uid()));

-- =============================================
-- Storage RLS Policies
-- =============================================

-- Users can upload to their own folder
CREATE POLICY "Users can upload their own documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can read their own files
CREATE POLICY "Users can view their own documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins can read all documents
CREATE POLICY "Admins can view all documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.has_role(auth.uid(), 'admin')
  );
