"use client";

import { useEffect, useRef } from "react";
import { severityToColor } from "@/lib/maps/helpers";
import type { ZoneDensity } from "@/types";

interface ZoneMarkersProps {
  map: google.maps.Map | null;
  zones: ZoneDensity[];
}

export function ZoneMarkers({ map, zones }: ZoneMarkersProps) {
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }

    zones.forEach((zone) => {
      const circle = new google.maps.Circle({
        strokeColor: severityToColor(zone.severity),
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: severityToColor(zone.severity),
        fillOpacity: 0.35,
        map,
        center: { lat: zone.latitude, lng: zone.longitude },
        radius: 20 + zone.density * 30, // Visual scaling based on density
      });

      circle.addListener("click", () => {
        const content = `
          <div style="color: #1f2937; padding: 8px;">
            <h3 style="font-weight: bold; font-size: 1.1em; margin-bottom: 4px;">${zone.name}</h3>
            <p>Density: <strong>${(zone.density * 100).toFixed(1)}%</strong></p>
            <p>Attendees: ${zone.currentCount} / ${zone.capacity}</p>
            <p style="margin-top: 4px; color: ${severityToColor(zone.severity)}; text-transform: uppercase; font-weight: bold;">
              ${zone.severity}
            </p>
          </div>
        `;
        infoWindowRef.current?.setContent(content);
        infoWindowRef.current?.setPosition({ lat: zone.latitude, lng: zone.longitude });
        infoWindowRef.current?.open(map);
      });

      circlesRef.current.push(circle);
    });

    return () => {
      circlesRef.current.forEach((c) => c.setMap(null));
    };
  }, [map, zones]);

  return null;
}
