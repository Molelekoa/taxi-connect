-- Indexes for matching engine performance
-- Parcels: matching queries filter by status + city names + dates + weight
CREATE INDEX IF NOT EXISTS idx_parcels_status ON public.parcels (status);
CREATE INDEX IF NOT EXISTS idx_parcels_pickup_location ON public.parcels (lower(pickup_location));
CREATE INDEX IF NOT EXISTS idx_parcels_dropoff_location ON public.parcels (lower(dropoff_location));
CREATE INDEX IF NOT EXISTS idx_parcels_sender_id ON public.parcels (sender_id);
CREATE INDEX IF NOT EXISTS idx_parcels_traveler_id ON public.parcels (traveler_id);
CREATE INDEX IF NOT EXISTS idx_parcels_payment_status ON public.parcels (payment_status);

-- Trips: matching queries filter by status + city names + date + weight capacity
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips (status);
CREATE INDEX IF NOT EXISTS idx_trips_origin_city ON public.trips (lower(origin_city));
CREATE INDEX IF NOT EXISTS idx_trips_destination_city ON public.trips (lower(destination_city));
CREATE INDEX IF NOT EXISTS idx_trips_traveler_id ON public.trips (traveler_id);
CREATE INDEX IF NOT EXISTS idx_trips_travel_date ON public.trips (travel_date);

-- Matches: existence checks and status filtering
CREATE INDEX IF NOT EXISTS idx_matches_parcel_trip ON public.matches (parcel_id, trip_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches (status);
CREATE INDEX IF NOT EXISTS idx_matches_trip_id ON public.matches (trip_id);

-- Notifications: user queries + type filtering
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications (user_id, read);

-- Payment records: lookup by parcel and user
CREATE INDEX IF NOT EXISTS idx_payment_records_parcel_id ON public.payment_records (parcel_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON public.payment_records (user_id);

-- Audit log and metrics: admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON public.audit_log (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_app_metrics_created_at ON public.app_metrics (created_at DESC);

-- Profiles: auth_id lookup (used by get_profile_id)
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON public.profiles (auth_id);