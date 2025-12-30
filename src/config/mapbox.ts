// Mapbox Configuration
// Get your token from: https://mapbox.com/account/access-tokens
// Since this is a PUBLIC/PUBLISHABLE token, it's safe to embed in client code

const LOCAL_STORAGE_KEY = 'mapbox_token_override';

// Runtime getter for Mapbox token
// Priority: 1) localStorage override (for admin/debug), 2) env variable
export function getMapboxToken(): string | undefined {
  // Check localStorage first (allows runtime updates without rebuild)
  if (typeof window !== 'undefined') {
    const localToken = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localToken) return localToken;
  }
  
  // Fall back to environment variable (baked at build time)
  return import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;
}

// Admin helpers for setting token via localStorage
export function setMapboxTokenOverride(token: string): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, token);
}

export function clearMapboxTokenOverride(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export function hasMapboxTokenOverride(): boolean {
  return !!localStorage.getItem(LOCAL_STORAGE_KEY);
}

// Check if we're in admin/dev mode
export function isAdminMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Dev mode or ?admin=1 query param
  return import.meta.env.DEV || new URLSearchParams(window.location.search).has('admin');
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
