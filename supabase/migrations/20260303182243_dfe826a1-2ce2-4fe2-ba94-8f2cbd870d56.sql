-- Fix CHECK constraint to include all statuses used in the app
ALTER TABLE public.parcels DROP CONSTRAINT IF EXISTS parcels_status_check;
ALTER TABLE public.parcels ADD CONSTRAINT parcels_status_check CHECK (
  status = ANY (ARRAY[
    'available', 'pending', 'matched', 'collected',
    'in_transit', 'in-transit',
    'pending_confirmation',
    'delivered_pending_verification', 'delivered_verified',
    'delivered', 'cancelled'
  ]::text[])
);