ALTER TABLE public.parcels
  ADD COLUMN delivery_lat numeric,
  ADD COLUMN delivery_lng numeric,
  ADD COLUMN delivery_geotagged_at timestamptz;