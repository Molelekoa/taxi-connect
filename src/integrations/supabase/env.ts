// Single source of truth for Supabase connection settings.
//
// Values come from VITE_ env vars when provided, otherwise fall back to the
// built-in project credentials. These are *publishable* (anon) values that
// ship inside the client bundle regardless, so the fallback introduces no new
// exposure — it just lets the app boot when no .env is present (e.g. Lovable
// CI builds). Real secrets (YOCO_SECRET_KEY etc.) live ONLY in Supabase Edge
// Function secrets, never here.
export const SUPABASE_PROJECT_ID =
  import.meta.env.VITE_SUPABASE_PROJECT_ID || "jlhyoqfsyadxvuhfesmc";

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsaHlvcWZzeWFkeHZ1aGZlc21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1MTMwODgsImV4cCI6MjA4NzA4OTA4OH0.7sj-0rbBu6--tUA-juGtWy8vCoNBkGAOSZuflYf8Jj4";
