
-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Add columns to parcels for matching
ALTER TABLE public.parcels
  ADD COLUMN IF NOT EXISTS pickup_earliest date,
  ADD COLUMN IF NOT EXISTS pickup_latest date,
  ADD COLUMN IF NOT EXISTS dimensions text,
  ADD COLUMN IF NOT EXISTS photo_url text;

-- Create trips table
CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  traveler_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  origin_city text NOT NULL,
  destination_city text NOT NULL,
  travel_date date NOT NULL,
  available_weight_kg numeric NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and admins can view trips"
  ON public.trips FOR SELECT TO authenticated
  USING (owns_profile(traveler_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can insert trips"
  ON public.trips FOR INSERT TO authenticated
  WITH CHECK (owns_profile(traveler_id));

CREATE POLICY "Owners and admins can update trips"
  ON public.trips FOR UPDATE TO authenticated
  USING (owns_profile(traveler_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners and admins can delete trips"
  ON public.trips FOR DELETE TO authenticated
  USING (owns_profile(traveler_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Create matches table
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id uuid NOT NULL REFERENCES public.parcels(id) ON DELETE CASCADE,
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Matches visible to parcel sender, trip traveler, or admin
CREATE POLICY "Match parties and admins can view matches"
  ON public.matches FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.parcels p WHERE p.id = parcel_id AND p.sender_id = get_profile_id(auth.uid()))
    OR EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND owns_profile(t.traveler_id))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Only trip traveler or admin can update (accept/reject)
CREATE POLICY "Trip traveler and admins can update matches"
  ON public.matches FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND owns_profile(t.traveler_id))
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  related_match_id uuid REFERENCES public.matches(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (owns_profile(user_id));

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (owns_profile(user_id));

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger functions for auto-matching via pg_net
CREATE OR REPLACE FUNCTION public.notify_new_parcel()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://jlhyoqfsyadxvuhfesmc.supabase.co/functions/v1/find-matching-trips',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object('parcelId', NEW.id)::text
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_parcel_insert
  AFTER INSERT ON public.parcels
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_parcel();

CREATE OR REPLACE FUNCTION public.notify_new_trip()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://jlhyoqfsyadxvuhfesmc.supabase.co/functions/v1/find-matching-parcels',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object('tripId', NEW.id)::text
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_trip_insert
  AFTER INSERT ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_trip();
