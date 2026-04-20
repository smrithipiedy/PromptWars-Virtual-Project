import { useEffect, useState } from "react";
import type { FloorPlanAnalysis, VenueLocation } from "@/types";

export interface FloorPlanData {
  timestamp: string;
  analysis: FloorPlanAnalysis;
  venue: VenueLocation;
}

/**
 * Hook to access floor plan analysis from the upload page
 * Listens for updates when a new floor plan is uploaded
 */
export function useFloorPlanData() {
  const [data, setData] = useState<FloorPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load initial data from localStorage
    const stored = localStorage.getItem("floorPlanAnalysis");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (error) {
        console.warn("Failed to parse floor plan data from localStorage");
      }
    }
    setIsLoading(false);

    // Listen for updates from upload page
    const handleFloorPlanUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<FloorPlanData>;
      setData(customEvent.detail);
    };

    window.addEventListener("floorPlanUpdated", handleFloorPlanUpdate);
    return () => {
      window.removeEventListener("floorPlanUpdated", handleFloorPlanUpdate);
    };
  }, []);

  const clearData = () => {
    localStorage.removeItem("floorPlanAnalysis");
    setData(null);
  };

  return { data, isLoading, clearData };
}
