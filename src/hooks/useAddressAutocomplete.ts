import { useState, useEffect, useCallback, useRef } from 'react';
import { getMapboxToken } from '@/config/mapbox';

export interface AddressSuggestion {
  id: string;
  placeName: string;
  text: string;
}

export function useAddressAutocomplete(query: string, debounceMs = 300) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    const token = getMapboxToken();
    if (!token || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${token}&country=ZA,BW,LS,MZ,NA,SZ,ZM,ZW&limit=5&types=address,place,locality,neighborhood`;

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        setSuggestions([]);
        return;
      }

      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        setSuggestions(
          data.features.map((feature: any) => ({
            id: feature.id,
            placeName: feature.place_name,
            text: feature.text,
          }))
        );
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Address autocomplete error:', error);
        setSuggestions([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query);
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, debounceMs, fetchSuggestions]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  return { suggestions, isLoading, clearSuggestions };
}
