/**
 * Validates that the resolved Supabase configuration is usable.
 * Call this once at app startup (in main.tsx) so the app fails fast
 * with a clear error instead of crashing later with cryptic messages.
 *
 * Values resolve through src/integrations/supabase/env.ts, which falls
 * back to the built-in project credentials when no VITE_ env vars are
 * set — so a missing .env no longer bricks production builds.
 */

import {
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
} from "@/integrations/supabase/env";

const OPTIONAL_VARS_WITH_WARNINGS = [
  "VITE_APP_URL", // Falls back to window.location.origin
] as const;

export function validateEnv(): void {
  const missing: string[] = [];

  if (!SUPABASE_PROJECT_ID) missing.push("VITE_SUPABASE_PROJECT_ID");
  if (!SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!SUPABASE_PUBLISHABLE_KEY) missing.push("VITE_SUPABASE_PUBLISHABLE_KEY");

  if (!SUPABASE_URL.startsWith("https://") || !SUPABASE_URL.includes(".supabase.co")) {
    console.error(`❌ VITE_SUPABASE_URL does not look like a Supabase URL: ${SUPABASE_URL}`);
    missing.push("VITE_SUPABASE_URL (invalid format)");
  }

  if (missing.length > 0) {
    const message = `❌ Invalid Supabase configuration:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nCheck your .env file or build environment.`;
    console.error(message);

    // In production, show a user-friendly error instead of a blank page
    if (import.meta.env.PROD) {
      const root = document.getElementById("root");
      if (root) {
        root.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;padding:2rem;text-align:center;">
            <div>
              <h1 style="font-size:1.5rem;margin-bottom:0.5rem;">Configuration Error</h1>
              <p style="color:#666;">The app could not start due to missing configuration. Please contact the administrator.</p>
            </div>
          </div>
        `;
      }
    }

    throw new Error(`Invalid Supabase configuration: ${missing.join(", ")}`);
  }

  // Warn about optional vars that enhance functionality
  for (const key of OPTIONAL_VARS_WITH_WARNINGS) {
    const value = import.meta.env[key];
    if (!value || value.trim() === "") {
      console.warn(`⚠️ Optional env var ${key} is not set. Using fallback.`);
    }
  }
}
