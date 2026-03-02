
-- ============================================================
-- 1. PERFORMANCE INDEXES
-- ============================================================

-- Parcels: matching engine + browse
CREATE INDEX IF NOT EXISTS idx_parcels_status_pickup_dropoff
  ON public.parcels (status, pickup_location, dropoff_location);

-- Parcels: sender dashboard
CREATE INDEX IF NOT EXISTS idx_parcels_sender_status
  ON public.parcels (sender_id, status);

-- Parcels: traveler assigned
CREATE INDEX IF NOT EXISTS idx_parcels_traveler
  ON public.parcels (traveler_id);

-- Trips: matching engine
CREATE INDEX IF NOT EXISTS idx_trips_status_route_date
  ON public.trips (status, origin_city, destination_city, travel_date);

-- Trips: traveler dashboard
CREATE INDEX IF NOT EXISTS idx_trips_traveler_status
  ON public.trips (traveler_id, status);

-- Matches: duplicate prevention
CREATE INDEX IF NOT EXISTS idx_matches_parcel_trip
  ON public.matches (parcel_id, trip_id);

-- Matches: traveler queries
CREATE INDEX IF NOT EXISTS idx_matches_trip_status
  ON public.matches (trip_id, status);

-- Matches: sender queries
CREATE INDEX IF NOT EXISTS idx_matches_parcel_status
  ON public.matches (parcel_id, status);

-- Notifications: bell queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
  ON public.notifications (user_id, read, created_at DESC);

-- Traveler routes: route lookups
CREATE INDEX IF NOT EXISTS idx_traveler_routes_profile
  ON public.traveler_routes (traveler_profile_id);

-- Profiles: RLS performance (critical for get_profile_id)
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id
  ON public.profiles (auth_id);

-- ============================================================
-- 2. AUDIT LOG TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  old_values jsonb,
  new_values jsonb,
  performed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Admin-only read
CREATE POLICY "Admins can view audit logs"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- No INSERT/UPDATE/DELETE policies — only triggers write

-- ============================================================
-- 3. AUDIT TRIGGER FUNCTIONS
-- ============================================================

-- Traveler profile status changes
CREATE OR REPLACE FUNCTION public.audit_traveler_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_log (action, table_name, record_id, old_values, new_values, performed_by)
    VALUES (
      CASE
        WHEN NEW.status = 'approved' THEN 'traveler_approved'
        WHEN NEW.status = 'rejected' THEN 'traveler_rejected'
        ELSE 'status_changed'
      END,
      'traveler_profiles',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_traveler_status
  AFTER UPDATE ON public.traveler_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_traveler_status_change();

-- Parcel status changes
CREATE OR REPLACE FUNCTION public.audit_parcel_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_log (action, table_name, record_id, old_values, new_values, performed_by)
    VALUES (
      CASE
        WHEN NEW.status = 'matched' THEN 'parcel_matched'
        WHEN NEW.status = 'delivered' THEN 'parcel_delivered'
        ELSE 'status_changed'
      END,
      'parcels',
      NEW.id,
      jsonb_build_object('status', OLD.status, 'traveler_id', OLD.traveler_id),
      jsonb_build_object('status', NEW.status, 'traveler_id', NEW.traveler_id),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_parcel_status
  AFTER UPDATE ON public.parcels
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_parcel_status_change();

-- Match status changes
CREATE OR REPLACE FUNCTION public.audit_match_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.audit_log (action, table_name, record_id, old_values, new_values, performed_by)
    VALUES (
      CASE
        WHEN NEW.status = 'accepted' THEN 'match_accepted'
        ELSE 'status_changed'
      END,
      'matches',
      NEW.id,
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_match_status
  AFTER UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_match_status_change();

-- ============================================================
-- 4. APP METRICS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name text NOT NULL,
  metric_value numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_metrics ENABLE ROW LEVEL SECURITY;

-- Admin-only read
CREATE POLICY "Admins can view metrics"
  ON public.app_metrics
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- ============================================================
-- 5. LOG METRIC FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_metric(_name text, _value numeric DEFAULT 1)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  INSERT INTO public.app_metrics (metric_name, metric_value)
  VALUES (_name, _value);
$$;

-- ============================================================
-- 6. AUTO-LOG METRICS VIA TRIGGERS
-- ============================================================

-- Log parcel creation
CREATE OR REPLACE FUNCTION public.metric_parcel_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.log_metric('parcel_created');
  RETURN NEW;
END;
$$;

CREATE TRIGGER metric_on_parcel_insert
  AFTER INSERT ON public.parcels
  FOR EACH ROW
  EXECUTE FUNCTION public.metric_parcel_created();

-- Log match creation
CREATE OR REPLACE FUNCTION public.metric_match_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.log_metric('match_created');
  RETURN NEW;
END;
$$;

CREATE TRIGGER metric_on_match_insert
  AFTER INSERT ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.metric_match_created();

-- Log claim (match accepted)
CREATE OR REPLACE FUNCTION public.metric_claim_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'accepted' THEN
    PERFORM public.log_metric('claim_completed');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER metric_on_claim
  AFTER UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.metric_claim_completed();
