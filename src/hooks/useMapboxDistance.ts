import { useState, useEffect, useRef } from 'react';
import { getDistanceFromAddresses, Coordinates } from '@/lib/mapbox';

interface DistanceResult {
  distance: number;
  pickupPlace: string;
  deliveryPlace: string;
  pickupCoordinates: Coordinates;
  deliveryCoordinates: Coordinates;
}

export interface UseMapboxDistanceResult {
  distance: number | null;
  isLoading: boolean;
  error: string | null;
  pickupPlace: string | null;
  deliveryPlace: string | null;
  pickupCoordinates: Coordinates | null;
  deliveryCoordinates: Coordinates | null;
}

export function useMapboxDistance(
  pickupLocation: string,
  deliveryLocation: string,
  skipApiCall: boolean = false // Skip API for cross-border (use predefined)
): UseMapboxDistanceResult {
  const [result, setResult] = useState<DistanceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<string>('');

  useEffect(() => {
    // Clear any pending timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Reset if inputs are empty or skip is enabled
    if (!pickupLocation || !deliveryLocation || skipApiCall) {
      setResult(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Avoid duplicate fetches
    const fetchKey = `${pickupLocation}|${deliveryLocation}`;
    if (fetchKey === lastFetchRef.current) {
      return;
    }

    // Require minimum input length
    if (pickupLocation.length < 3 || deliveryLocation.length < 3) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Debounce API calls (800ms)
    debounceRef.current = setTimeout(async () => {
      try {
        lastFetchRef.current = fetchKey;
        const distanceResult = await getDistanceFromAddresses(
          pickupLocation,
          deliveryLocation
        );

        if (distanceResult) {
          setResult(distanceResult);
          setError(null);
        } else {
          setError('Could not calculate distance. Please check your addresses.');
          setResult(null);
        }
      } catch (err) {
        console.error('Distance calculation error:', err);
        setError('Failed to calculate distance');
        setResult(null);
      } finally {
        setIsLoading(false);
      }
    }, 800);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [pickupLocation, deliveryLocation, skipApiCall]);

  return {
    distance: result?.distance ?? null,
    isLoading,
    error,
    pickupPlace: result?.pickupPlace ?? null,
    deliveryPlace: result?.deliveryPlace ?? null,
    pickupCoordinates: result?.pickupCoordinates ?? null,
    deliveryCoordinates: result?.deliveryCoordinates ?? null,
  };
}
