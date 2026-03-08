/**
 * Validates that all required VITE_ environment variables are set.
 * Call this once at app startup (in main.tsx) so the app fails fast
 * with a clear error instead of crashing later with cryptic messages.
 */

const REQUIRED_VARS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
  "VITE_SUPABASE_PROJECT_ID",
] as const;

const OPTIONAL_VARS_WITH_WARNINGS = [
  "VITE_APP_URL", // Falls back to window.location.origin
] as const;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_VARS) {
    const value = import.meta.env[key];
    if (!value || value.trim() === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    const message = `❌ Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nCheck your .env file or Lovable project settings.`;
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

    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  // Warn about optional vars that enhance functionality
  for (const key of OPTIONAL_VARS_WITH_WARNINGS) {
    const value = import.meta.env[key];
    if (!value || value.trim() === "") {
      console.warn(`⚠️ Optional env var ${key} is not set. Using fallback.`);
    }
  }
}
