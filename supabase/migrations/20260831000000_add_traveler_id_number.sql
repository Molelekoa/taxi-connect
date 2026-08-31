-- Add ID number and passport number columns to traveler_profiles.
-- These were previously captured in the carrier signup form but never
-- persisted to the database (the server only received the ID copy file).
ALTER TABLE public.traveler_profiles
  ADD COLUMN IF NOT EXISTS id_number TEXT,
  ADD COLUMN IF NOT EXISTS passport_number TEXT;
