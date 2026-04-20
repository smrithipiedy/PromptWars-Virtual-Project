import type { ZoneDensity } from "@/types";

export const MOCK_ZONES: ZoneDensity[] = [
  {
    id: "zone-main-stage",
    name: "Main Stage",
    latitude: 13.0827,
    longitude: 80.2707,
    capacity: 500,
    currentCount: 460,
    density: 0.92,
    severity: "critical",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "zone-food-court",
    name: "Food Court",
    latitude: 13.0837,
    longitude: 80.2717,
    capacity: 200,
    currentCount: 140,
    density: 0.7,
    severity: "moderate",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "zone-entry-gate",
    name: "Entry Gate",
    latitude: 13.0817,
    longitude: 80.2697,
    capacity: 100,
    currentCount: 85,
    density: 0.85,
    severity: "high",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "zone-rest-area",
    name: "Rest Area",
    latitude: 13.0847,
    longitude: 80.2727,
    capacity: 150,
    currentCount: 40,
    density: 0.27,
    severity: "low",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "zone-merch-stall",
    name: "Merch Stall",
    latitude: 13.0822,
    longitude: 80.272,
    capacity: 80,
    currentCount: 65,
    density: 0.81,
    severity: "high",
    updatedAt: new Date().toISOString(),
  },
];

export const DENSITY_THRESHOLDS = {
  LOW: 0.5,
  MODERATE: 0.75,
  HIGH: 0.9,
  CRITICAL: 1.0,
};

export const ALERT_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

export const MAP_CENTER = {
  lat: 13.0827,
  lng: 80.2707,
};
