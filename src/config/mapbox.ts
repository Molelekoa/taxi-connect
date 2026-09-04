// Mapbox Configuration
// The public (pk.*) token is supplied via VITE_MAPBOX_TOKEN. There is NO
// hardcoded fallback here: if the token is missing or empty, getMapboxToken()
// returns "" and map components / geocoding gracefully no-op. In production,
// create a token restricted to your deployed domains in the Mapbox dashboard
// and set it as VITE_MAPBOX_TOKEN (and in Lovable's env). Never embed a
// plain-text fallback token in source control.

export function getMapboxToken(): string {
  return import.meta.env.VITE_MAPBOX_TOKEN || "";
}

export const MAPBOX_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
} as const;

// South Africa center coordinates
export const DEFAULT_CENTER: [number, number] = [25, -29];
export const DEFAULT_ZOOM = 4;
