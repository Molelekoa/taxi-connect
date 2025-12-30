// Mapbox Configuration
// The public token is stored as a Lovable secret (VITE_MAPBOX_TOKEN)
// To add your token: Go to Lovable Secrets and add VITE_MAPBOX_TOKEN
// Get your token from: https://mapbox.com/account/access-tokens

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

export const MAPBOX_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
} as const;

// South Africa center coordinates
export const DEFAULT_CENTER: [number, number] = [25, -29];
export const DEFAULT_ZOOM = 4;
