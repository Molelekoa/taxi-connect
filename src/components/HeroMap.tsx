import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapboxToken, MAPBOX_STYLES } from "@/config/mapbox";

/** Decorative map showing the SA / Lesotho / Zimbabwe corridor.
 *  No interactivity — purely visual background for the hero section. */

const CITIES: { name: string; coords: [number, number] }[] = [
  { name: "Johannesburg", coords: [28.0473, -26.2041] },
  { name: "Pretoria", coords: [28.1881, -25.7479] },
  { name: "Cape Town", coords: [18.4241, -33.9249] },
  { name: "Durban", coords: [31.0218, -29.8587] },
  { name: "Bloemfontein", coords: [26.2091, -29.0852] },
  { name: "Harare", coords: [31.0335, -17.8292] },
  { name: "Bulawayo", coords: [28.58, -20.15] },
  { name: "Maseru", coords: [27.4833, -29.3167] },
];

const ROUTE_LINES: [number, number][][] = [
  // JHB → HRE
  [[28.0473, -26.2041], [28.58, -20.15], [31.0335, -17.8292]],
  // PTA → BUL
  [[28.1881, -25.7479], [28.58, -20.15]],
  // CPT → MAS
  [[18.4241, -33.9249], [26.2091, -29.0852], [27.4833, -29.3167]],
  // JHB → MAS
  [[28.0473, -26.2041], [27.4833, -29.3167]],
  // DBN → JHB
  [[31.0218, -29.8587], [28.0473, -26.2041]],
  // BFN → MAS
  [[26.2091, -29.0852], [27.4833, -29.3167]],
];

const HeroMap = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const token = getMapboxToken();

  useEffect(() => {
    if (!containerRef.current || !token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center: [27, -25],
      zoom: 4.2,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0,
    });

    mapRef.current = map;

    map.on("load", () => {
      // Route lines
      map.addSource("hero-routes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: ROUTE_LINES.map((coords) => ({
            type: "Feature" as const,
            properties: {},
            geometry: { type: "LineString" as const, coordinates: coords },
          })),
        },
      });

      map.addLayer({
        id: "hero-routes-glow",
        type: "line",
        source: "hero-routes",
        paint: {
          "line-color": "hsl(175, 85%, 35%)",
          "line-width": 5,
          "line-opacity": 0.15,
          "line-blur": 4,
        },
      });

      map.addLayer({
        id: "hero-routes-line",
        type: "line",
        source: "hero-routes",
        paint: {
          "line-color": "hsl(175, 85%, 35%)",
          "line-width": 1.5,
          "line-opacity": 0.5,
          "line-dasharray": [4, 3],
        },
      });

      // City dots
      map.addSource("hero-cities", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: CITIES.map((c) => ({
            type: "Feature" as const,
            properties: { name: c.name },
            geometry: { type: "Point" as const, coordinates: c.coords },
          })),
        },
      });

      map.addLayer({
        id: "hero-city-glow",
        type: "circle",
        source: "hero-cities",
        paint: {
          "circle-radius": 8,
          "circle-color": "hsl(24, 90%, 55%)",
          "circle-opacity": 0.12,
          "circle-blur": 1,
        },
      });

      map.addLayer({
        id: "hero-city-dot",
        type: "circle",
        source: "hero-cities",
        paint: {
          "circle-radius": 3,
          "circle-color": "hsl(24, 90%, 55%)",
          "circle-opacity": 0.8,
          "circle-stroke-width": 1,
          "circle-stroke-color": "hsl(24, 90%, 55%)",
          "circle-stroke-opacity": 0.3,
        },
      });

      map.addLayer({
        id: "hero-city-labels",
        type: "symbol",
        source: "hero-cities",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 10,
          "text-offset": [0, 1.2],
          "text-anchor": "top",
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
        },
        paint: {
          "text-color": "hsl(0, 0%, 60%)",
          "text-halo-color": "hsl(220, 14%, 8%)",
          "text-halo-width": 1.5,
        },
      });

      setReady(true);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [token]);

  return (
    <div className="w-full h-full">
      <div
        ref={containerRef}
        className={`w-full h-full transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

export default HeroMap;
