
-- Add proof columns to matches table
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS proof_photo_url text,
  ADD COLUMN IF NOT EXISTS proof_geotag jsonb,
  ADD COLUMN IF NOT EXISTS proof_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_status text;

-- Drop existing parcels status CHECK constraint and recreate with new values
DO $$
BEGIN
  -- Find and drop the existing check constraint on status
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints cc
    JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
    WHERE ccu.table_name = 'parcels' AND ccu.column_name = 'status'
    AND cc.constraint_schema = 'public'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE public.parcels DROP CONSTRAINT ' || cc.constraint_name
      FROM information_schema.check_constraints cc
      JOIN information_schema.constraint_column_usage ccu ON cc.constraint_name = ccu.constraint_name
      WHERE ccu.table_name = 'parcels' AND ccu.column_name = 'status'
      AND cc.constraint_schema = 'public'
      LIMIT 1
    );
  END IF;
END $$;

-- Add updated CHECK constraint with new status values
ALTER TABLE public.parcels
  ADD CONSTRAINT parcels_status_check CHECK (
    status IN (
      'available', 'pending', 'matched', 'collected', 'in_transit',
      'pending_confirmation', 'delivered', 'cancelled',
      'delivered_pending_verification', 'delivered_verified'
    )
  );
