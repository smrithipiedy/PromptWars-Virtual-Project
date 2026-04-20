"use client";

import React, { useEffect, useRef, useState } from "react";
import { zonesToHeatmapPoints } from "@/lib/maps/helpers";
import { MAP_CENTER } from "@/lib/constants";
import type { ZoneDensity } from "@/types";
import type { PinnedLocation } from "./MapChatbot";

const PIN_COLORS_HEX: Record<string, string> = {
  restroom: "#06b6d4",
  exit: "#ef4444",
  food: "#f97316",
  stage: "#8b5cf6",
  entry: "#22c55e",
  info: "#4f7eff",
  other: "#9ca3af",
};

interface CrowdHeatmapProps {
  zones: ZoneDensity[];
  userLocation?: { lat: number; lng: number };
  pinnedLocations?: PinnedLocation[];
}

export function CrowdHeatmap({ zones, userLocation, pinnedLocations = [] }: CrowdHeatmapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const heatmapRef = useRef<google.maps.visualization.HeatmapLayer | null>(null);
  const userMarkerRef = useRef<any>(null);
  const userCircleRef = useRef<google.maps.Circle | null>(null);
  const pinMarkersRef = useRef<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  /* ── Init map ── */
  useEffect(() => {
    if (initialized.current) return;

    const initMap = async () => {
      if (!mapRef.current) return;
      if (!window.google?.maps) {
        setTimeout(initMap, 500); // Wait for global script
        return;
      }
      initialized.current = true;

      try {
        const center = userLocation ?? MAP_CENTER;
        const { Map } = await (google.maps as any).importLibrary("maps");
        const { HeatmapLayer } = await (google.maps as any).importLibrary("visualization");

        const m = new Map(mapRef.current, {
          center,
          zoom: userLocation ? 16 : 15,
          mapId: "crowdsense-map",
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#0d0d1a" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#0d0d1a" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#5a6478" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
            { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#222240" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#060612" }] },
            { featureType: "poi", elementType: "geometry", stylers: [{ color: "#111122" }] },
            { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#0a1a10" }] },
          ],
        });

        const hl = new HeatmapLayer({
          data: zonesToHeatmapPoints(zones).map((p: any) => new google.maps.LatLng(p.lat, p.lng)),
          map: m,
          radius: 60,
          opacity: 0.75,
          gradient: [
            "rgba(0,255,255,0)", "rgba(0,191,255,1)", "rgba(0,128,255,1)",
            "rgba(128,0,255,1)", "rgba(255,0,128,1)", "rgba(255,0,0,1)",
          ],
        });

        mapInstance.current = m;
        heatmapRef.current = hl;
        setLoading(false);
      } catch (err) {
        console.error("Map init failed:", err);
        setLoading(false);
      }
    };

    initMap();
  }, []);

  /* ── Update heatmap ── */
  useEffect(() => {
    if (!heatmapRef.current) return;
    heatmapRef.current.setData(
      zonesToHeatmapPoints(zones).map((p) => new google.maps.LatLng(p.lat, p.lng))
    );
  }, [zones]);

  /* ── User location marker ── */
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !userLocation) return;

    // Remove old
    if (userMarkerRef.current) { try { userMarkerRef.current.map = null; } catch { (userMarkerRef.current as any).setMap?.(null); } }
    if (userCircleRef.current) userCircleRef.current.setMap(null);

    // Blue dot element
    const dot = document.createElement("div");
    dot.style.cssText = "width:16px;height:16px;background:#4f7eff;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 5px rgba(79,126,255,0.25),0 2px 8px rgba(0,0,0,0.5);";
    const ring = document.createElement("div");
    ring.style.cssText = "position:absolute;inset:-9px;border-radius:50%;border:2px solid rgba(79,126,255,0.4);animation:cc-ping 2s cubic-bezier(0,0,0.2,1) infinite;";
    dot.appendChild(ring);

    try {
      const AE = (google.maps as any).marker?.AdvancedMarkerElement;
      if (AE) {
        userMarkerRef.current = new AE({ map, position: userLocation, content: dot, title: "You" });
      } else {
        userMarkerRef.current = new google.maps.Marker({
          map, position: userLocation, title: "You", zIndex: 999,
          icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: "#4f7eff", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 3, scale: 8 },
        });
      }
    } catch { /* ignore */ }

    userCircleRef.current = new google.maps.Circle({
      map, center: userLocation, radius: 35,
      fillColor: "#4f7eff", fillOpacity: 0.08,
      strokeColor: "#4f7eff", strokeOpacity: 0.3, strokeWeight: 1,
    });

    map.panTo(userLocation);
  }, [userLocation]);

  /* ── Pinned locations from chatbot ── */
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    pinnedLocations.forEach((pin) => {
      if (pinMarkersRef.current.has(pin.id)) return; // already rendered

      const color = PIN_COLORS_HEX[pin.type] ?? PIN_COLORS_HEX.other;

      // Build custom marker element
      const el = document.createElement("div");
      el.style.cssText = `display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer;`;
      const bubble = document.createElement("div");
      bubble.style.cssText = `background:${color};color:#fff;font-size:10px;font-weight:800;padding:4px 8px;border-radius:8px;white-space:nowrap;box-shadow:0 2px 12px rgba(0,0,0,0.5);`;
      bubble.textContent = pin.label;
      const tail = document.createElement("div");
      tail.style.cssText = `width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${color};`;
      el.appendChild(bubble);
      el.appendChild(tail);

      try {
        const AE = (google.maps as any).marker?.AdvancedMarkerElement;
        if (AE) {
          const m = new AE({ map, position: { lat: pin.lat, lng: pin.lng }, content: el, title: pin.label });
          pinMarkersRef.current.set(pin.id, m);
        } else {
          const m = new google.maps.Marker({
            map, position: { lat: pin.lat, lng: pin.lng },
            title: pin.label, label: { text: pin.label, color: "#fff", fontSize: "10px", fontWeight: "800" },
            icon: { path: google.maps.SymbolPath.CIRCLE, fillColor: color, fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2, scale: 10 },
          });
          pinMarkersRef.current.set(pin.id, m);
        }
      } catch { /* ignore */ }

      // Pan to pin
      map.panTo({ lat: pin.lat, lng: pin.lng });
    });
  }, [pinnedLocations]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <style>{`@keyframes cc-ping{0%{transform:scale(1);opacity:1}100%{transform:scale(2.2);opacity:0}}`}</style>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#04040a] z-10 gap-4">
          <div className="w-10 h-10 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" />
          <p className="text-[#7070a0] text-sm font-semibold">Initialising map…</p>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" role="application" aria-label="Real-time crowd density heatmap" />
    </div>
  );
}
