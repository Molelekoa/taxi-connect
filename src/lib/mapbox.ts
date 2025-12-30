import { MAPBOX_TOKEN } from '@/config/mapbox';

export interface Coordinates {
  lng: number;
  lat: number;
}

export interface GeocodeResult {
  coordinates: Coordinates;
  placeName: string;
}

// Geocode an address to coordinates
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!MAPBOX_TOKEN) {
    console.error('Mapbox token is not configured');
    return null;
  }

  try {
    // Bias search towards South Africa
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&country=ZA,BW,LS,MZ,NA,SZ,ZM,ZW&limit=1`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      return {
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1],
        },
        placeName: feature.place_name,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Get driving distance between two coordinates
export async function getDrivingDistance(
  origin: Coordinates,
  destination: Coordinates
): Promise<number | null> {
  if (!MAPBOX_TOKEN) {
    console.error('Mapbox token is not configured');
    return null;
  }

  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${MAPBOX_TOKEN}&overview=false`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Directions failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      // Distance is returned in meters, convert to km
      const distanceKm = data.routes[0].distance / 1000;
      return Math.round(distanceKm);
    }

    return null;
  } catch (error) {
    console.error('Directions error:', error);
    return null;
  }
}

// Combined function to get distance from addresses
export async function getDistanceFromAddresses(
  pickupAddress: string,
  deliveryAddress: string
): Promise<{ 
  distance: number; 
  pickupPlace: string; 
  deliveryPlace: string;
  pickupCoordinates: Coordinates;
  deliveryCoordinates: Coordinates;
} | null> {
  const [pickupResult, deliveryResult] = await Promise.all([
    geocodeAddress(pickupAddress),
    geocodeAddress(deliveryAddress),
  ]);

  if (!pickupResult || !deliveryResult) {
    return null;
  }

  const distance = await getDrivingDistance(
    pickupResult.coordinates,
    deliveryResult.coordinates
  );

  if (distance === null) {
    return null;
  }

  return {
    distance,
    pickupPlace: pickupResult.placeName,
    deliveryPlace: deliveryResult.placeName,
    pickupCoordinates: pickupResult.coordinates,
    deliveryCoordinates: deliveryResult.coordinates,
  };
}
