"use client";

import { useEffect, useRef } from "react";
import type { ZoneDensity } from "@/types";

interface RouteOverlayProps {
  map: google.maps.Map | null;
  zones: ZoneDensity[];
}

export function RouteOverlay({ map, zones }: RouteOverlayProps) {
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!map || zones.length === 0) return;

    // Find the safest (lowest density) zone
    const safestZone = [...zones].sort((a, b) => a.density - b.density)[0];

    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new google.maps.Marker({
      position: { lat: safestZone.latitude, lng: safestZone.longitude },
      map,
      title: `Suggested safe zone: ${safestZone.name}`,
      animation: google.maps.Animation.BOUNCE,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#22c55e",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#ffffff",
      },
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [map, zones]);

  return null;
}
