import { getMapboxToken } from '@/config/mapbox';

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
  const token = getMapboxToken();
  if (!token) {
    // Silent fail - no token configured
    return null;
  }

  try {
    // Bias search towards South Africa and SADC region (expanded country list)
    const encodedAddress = encodeURIComponent(address);
    // Include all SADC countries: ZA (South Africa), BW (Botswana), LS (Lesotho), MZ (Mozambique), 
    // NA (Namibia), SZ (Eswatini), ZM (Zambia), ZW (Zimbabwe), AO (Angola), CD (DRC), 
    // MW (Malawi), MU (Mauritius), SC (Seychelles), TZ (Tanzania), MG (Madagascar), KM (Comoros)
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${token}&country=ZA,BW,LS,MZ,NA,SZ,ZM,ZW,AO,CD,MW,MU,SC,TZ,MG,KM&limit=1`;

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.warn('Mapbox token rejected - check token validity and URL restrictions');
      }
      return null;
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
  const token = getMapboxToken();
  if (!token) {
    return null;
  }

  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?access_token=${token}&overview=false`;

    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        console.warn('Mapbox token rejected - check token validity and URL restrictions');
      }
      return null;
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
