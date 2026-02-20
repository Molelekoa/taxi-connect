import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Coordinates } from '@/lib/mapbox';
import { getMapboxToken, MAPBOX_STYLES, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/config/mapbox';
import { MapPin, Navigation, Clock, Route } from 'lucide-react';

interface RouteMapProps {
  pickupCoordinates: Coordinates | null;
  deliveryCoordinates: Coordinates | null;
  pickupLabel?: string;
  deliveryLabel?: string;
}

interface RouteInfo {
  distance: number; // in km
  duration: number; // in minutes
}

const RouteMap = ({ 
  pickupCoordinates, 
  deliveryCoordinates, 
  pickupLabel = 'Pickup',
  deliveryLabel = 'Delivery' 
}: RouteMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const deliveryMarker = useRef<mapboxgl.Marker | null>(null);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  const token = getMapboxToken();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_STYLES.dark,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsLoading(false);
      
      // Add route source
      map.current?.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [],
          },
        },
      });

      // Add route glow layer (underneath)
      map.current?.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#FF6600',
          'line-width': 8,
          'line-opacity': 0.3,
          'line-blur': 3,
        },
      });

      // Add route layer
      map.current?.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#FF6600',
          'line-width': 4,
          'line-opacity': 0.9,
        },
      });

      // Mark map as ready AFTER sources/layers are added
      setMapReady(true);
    });

    return () => {
      setMapReady(false);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      pickupMarker.current?.remove();
      deliveryMarker.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, [token]);

  // Safely create popup DOM content (prevents XSS from user-controlled labels)
  const createPopupContent = (emoji: string, title: string, colorClass: string, label: string) => {
    const container = document.createElement('div');
    container.className = 'p-2';

    const titleDiv = document.createElement('div');
    titleDiv.className = `font-semibold ${colorClass} text-sm mb-1`;
    titleDiv.textContent = `${emoji} ${title}`; // textContent auto-escapes HTML

    const labelDiv = document.createElement('div');
    labelDiv.className = 'text-xs text-gray-700';
    labelDiv.textContent = label; // textContent auto-escapes HTML

    container.appendChild(titleDiv);
    container.appendChild(labelDiv);
    return container;
  };

  // Route update function
  const updateRoute = useCallback(async () => {
    if (!map.current || !pickupCoordinates || !deliveryCoordinates || !token) {
      return;
    }

    // Clear existing markers
    pickupMarker.current?.remove();
    deliveryMarker.current?.remove();

    // Create custom marker elements
    const createMarkerElement = (color: string, icon: 'pickup' | 'delivery') => {
      const el = document.createElement('div');
      el.className = 'flex items-center justify-center';
      el.innerHTML = `
        <div class="relative">
          <div class="w-8 h-8 rounded-full ${color === 'green' ? 'bg-green-500' : 'bg-primary'} flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${icon === 'pickup' 
                ? '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>' 
                : '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'}
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${color === 'green' ? 'bg-green-500' : 'bg-primary'} rotate-45"></div>
        </div>
      `;
      return el;
    };

    // Add pickup marker (green) — uses setDOMContent to prevent XSS
    pickupMarker.current = new mapboxgl.Marker({ element: createMarkerElement('green', 'pickup') })
      .setLngLat([pickupCoordinates.lng, pickupCoordinates.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25, className: 'route-popup' })
          .setDOMContent(createPopupContent('📍', 'Pickup', 'text-green-600', pickupLabel))
      )
      .addTo(map.current);

    // Add delivery marker (orange) — uses setDOMContent to prevent XSS
    deliveryMarker.current = new mapboxgl.Marker({ element: createMarkerElement('orange', 'delivery') })
      .setLngLat([deliveryCoordinates.lng, deliveryCoordinates.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25, className: 'route-popup' })
          .setDOMContent(createPopupContent('🚚', 'Delivery', 'text-orange-600', deliveryLabel))
      )
      .addTo(map.current);

    // Fetch route geometry
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoordinates.lng},${pickupCoordinates.lat};${deliveryCoordinates.lng},${deliveryCoordinates.lat}?access_token=${token}&geometries=geojson&overview=full`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeGeometry = route.geometry;

        // Update route info
        setRouteInfo({
          distance: Math.round(route.distance / 1000), // Convert to km
          duration: Math.round(route.duration / 60), // Convert to minutes
        });

        // Safely update route source
        if (map.current) {
          const source = map.current.getSource('route') as mapboxgl.GeoJSONSource | undefined;
          if (source) {
            source.setData({
              type: 'Feature',
              properties: {},
              geometry: routeGeometry,
            });
          }
        }

        // Fit bounds to show entire route
        if (map.current) {
          const bounds = new mapboxgl.LngLatBounds();
          routeGeometry.coordinates.forEach((coord: [number, number]) => {
            bounds.extend(coord);
          });
          
          map.current.fitBounds(bounds, {
            padding: { top: 60, bottom: 60, left: 60, right: 60 },
            duration: 1000,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setRouteInfo(null);
    }
  }, [pickupCoordinates, deliveryCoordinates, pickupLabel, deliveryLabel, token]);

  // Update markers and route when coordinates change
  useEffect(() => {
    // Clear route info if coordinates are missing
    if (!pickupCoordinates || !deliveryCoordinates) {
      setRouteInfo(null);
      return;
    }

    // Wait for map to be fully ready with sources
    if (!mapReady || !map.current) {
      return;
    }

    // Clear pending update
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce route update to handle rapid changes
    updateTimeoutRef.current = setTimeout(() => {
      updateRoute();
    }, 150);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [mapReady, pickupCoordinates, deliveryCoordinates, updateRoute]);

  // Format duration to hours and minutes
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // No token - show neutral message
  if (!token) {
    return (
      <div className="relative h-64 bg-muted/30 rounded-lg flex items-center justify-center border border-dashed border-border">
        <div className="text-center text-muted-foreground p-4">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Map temporarily unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-64 md:h-80 rounded-lg overflow-hidden border border-border shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted/90 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </div>
      )}
      
      {/* Placeholder when no coordinates */}
      {(!pickupCoordinates || !deliveryCoordinates) && !isLoading && (
        <div className="absolute inset-0 bg-muted/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <Navigation className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground text-sm text-center px-4">
            Enter pickup and delivery locations to see the route
          </p>
        </div>
      )}

      {/* Route info overlay */}
      {routeInfo && pickupCoordinates && deliveryCoordinates && (
        <div className="absolute top-3 left-3 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border px-4 py-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Route className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground">{routeInfo.distance} km</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{formatDuration(routeInfo.duration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {pickupCoordinates && deliveryCoordinates && !isLoading && (
        <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-sm rounded-lg shadow-lg border border-border px-3 py-2">
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-muted-foreground">Pickup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">Delivery</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
