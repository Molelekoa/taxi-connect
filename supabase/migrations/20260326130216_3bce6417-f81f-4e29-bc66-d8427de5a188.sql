
CREATE TABLE public.driver_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  license_type TEXT NOT NULL,
  years_with_license TEXT NOT NULL,
  route_frequency TEXT NOT NULL,
  vehicle_description TEXT NOT NULL,
  max_load_kg INTEGER NOT NULL DEFAULT 50,
  loads_per_trip INTEGER NOT NULL DEFAULT 1,
  agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.driver_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit waitlist" ON public.driver_waitlist
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can view waitlist" ON public.driver_waitlist
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update waitlist" ON public.driver_waitlist
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
