
-- Add 'pending_confirmation' to parcels status and add sender_confirmed_at column
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS sender_confirmed_at timestamptz DEFAULT NULL;

-- Add cancel_reason column for tracking traveler cancellation reasons
ALTER TABLE public.parcels ADD COLUMN IF NOT EXISTS cancel_reason text DEFAULT NULL;
