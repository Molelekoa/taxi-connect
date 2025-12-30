// Mapbox Configuration
// Get your token from: https://mapbox.com/account/access-tokens
// Since this is a PUBLIC/PUBLISHABLE token, it's safe to embed in client code

// Read from environment variable (set via Lovable Secrets as VITE_MAPBOX_TOKEN)
const envToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

// Export the token - will be undefined if not configured
export const MAPBOX_TOKEN = envToken;

export const MAPBOX_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
} as const;

// South Africa center coordinates
export const DEFAULT_CENTER: [number, number] = [25, -29];
export const DEFAULT_ZOOM = 4;
