// Mapbox Configuration
// Public (pk.*) token — safe for client bundles. For production, create a
// token restricted to your deployed domains in the Mapbox dashboard and set
// it as VITE_MAPBOX_TOKEN. The fallback below keeps local dev working.

const FALLBACK_PUBLIC_TOKEN = 'pk.eyJ1IjoibW9yYW1vbGxvIiwiYSI6ImNtanN2emF5ejJhZGQzZnNlcmUxZnV4NjUifQ.EQSIcEZQUFhV6mCchcJyKg';

export function getMapboxToken(): string {
  return import.meta.env.VITE_MAPBOX_TOKEN || FALLBACK_PUBLIC_TOKEN;
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
