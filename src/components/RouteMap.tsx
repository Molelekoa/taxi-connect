import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Coordinates } from '@/lib/mapbox';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface RouteMapProps {
  pickupCoordinates: Coordinates | null;
  deliveryCoordinates: Coordinates | null;
  pickupLabel?: string;
  deliveryLabel?: string;
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
  const [isLoading, setIsLoading] = useState(true);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [25, -29], // Center on South Africa
      zoom: 4,
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
          'line-opacity': 0.8,
        },
      });
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update markers and route when coordinates change
  useEffect(() => {
    if (!map.current || !pickupCoordinates || !deliveryCoordinates) return;

    const updateRoute = async () => {
      // Clear existing markers
      pickupMarker.current?.remove();
      deliveryMarker.current?.remove();

      // Add pickup marker (green)
      pickupMarker.current = new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat([pickupCoordinates.lng, pickupCoordinates.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${pickupLabel}</strong>`))
        .addTo(map.current!);

      // Add delivery marker (orange)
      deliveryMarker.current = new mapboxgl.Marker({ color: '#FF6600' })
        .setLngLat([deliveryCoordinates.lng, deliveryCoordinates.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${deliveryLabel}</strong>`))
        .addTo(map.current!);

      // Fetch route geometry
      try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickupCoordinates.lng},${pickupCoordinates.lat};${deliveryCoordinates.lng},${deliveryCoordinates.lat}?access_token=${MAPBOX_TOKEN}&geometries=geojson`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const routeGeometry = data.routes[0].geometry;

          // Update route source
          const source = map.current?.getSource('route') as mapboxgl.GeoJSONSource;
          if (source) {
            source.setData({
              type: 'Feature',
              properties: {},
              geometry: routeGeometry,
            });
          }

          // Fit bounds to show entire route
          const bounds = new mapboxgl.LngLatBounds();
          routeGeometry.coordinates.forEach((coord: [number, number]) => {
            bounds.extend(coord);
          });
          
          map.current?.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            duration: 1000,
          });
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    // Wait for map to be loaded before updating
    if (map.current.isStyleLoaded()) {
      updateRoute();
    } else {
      map.current.on('load', updateRoute);
    }
  }, [pickupCoordinates, deliveryCoordinates, pickupLabel, deliveryLabel]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Mapbox token not configured</p>
      </div>
    );
  }

  return (
    <div className="relative h-64 md:h-80 rounded-lg overflow-hidden border border-border">
      <div ref={mapContainer} className="absolute inset-0" />
      {isLoading && (
        <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </div>
      )}
      {(!pickupCoordinates || !deliveryCoordinates) && !isLoading && (
        <div className="absolute inset-0 bg-muted/80 flex items-center justify-center">
          <p className="text-muted-foreground text-sm text-center px-4">
            Enter pickup and delivery locations to see the route
          </p>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
