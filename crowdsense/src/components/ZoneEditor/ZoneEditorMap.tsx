"use client";

import React, { useEffect, useRef, useState } from "react";
import { MAP_CENTER } from "@/lib/constants";
import { ZoneMarkers } from "@/components/Map/ZoneMarkers";
import type { ZoneDensity } from "@/types";

interface ZoneEditorMapProps {
  organizerUid: string;
}

export function ZoneEditorMap({ organizerUid }: ZoneEditorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [zones, setZones] = useState<ZoneDensity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<ZoneDensity | null>(null);
  const [showZoneForm, setShowZoneForm] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        const { Map } = (await (google.maps as any).importLibrary("maps"));

        const initializedMap = new Map(mapRef.current, {
          center: MAP_CENTER,
          zoom: 17,
          mapId: "zone-editor-map",
          disableDefaultUI: false,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          ],
        });

        setMap(initializedMap);

        // Add click listener for placing zones
        initializedMap.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            console.log("Zone placement:", e.latLng.lat(), e.latLng.lng());
            setShowZoneForm(true);
          }
        });

        setLoading(false);
      } catch (error) {
        console.error("Error initializing map:", error);
        setLoading(false);
      }
    };

    initMap();
  }, []);

  const handleAddZone = (zoneName: string, capacity: number) => {
    if (map) {
      const center = map.getCenter();
      if (center) {
        const newZone: ZoneDensity = {
          id: `zone-${Date.now()}`,
          name: zoneName,
          latitude: center.lat(),
          longitude: center.lng(),
          capacity: capacity,
          currentCount: 0,
          density: 0,
          severity: "low",
          updatedAt: new Date().toISOString(),
        };
        setZones([...zones, newZone]);
        setShowZoneForm(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {map && <ZoneMarkers map={map} zones={zones} />}

      {/* Zone Form Modal */}
      {showZoneForm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-4">Create Zone</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddZone(
                  formData.get("zoneName") as string,
                  parseInt(formData.get("capacity") as string)
                );
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Zone Name
                </label>
                <input
                  type="text"
                  name="zoneName"
                  placeholder="e.g., Main Stage"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  name="capacity"
                  placeholder="e.g., 500"
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
                  required
                  min="1"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowZoneForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
