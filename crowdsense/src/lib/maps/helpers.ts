import type { HeatmapPoint, ZoneDensity } from "@/types";

export function zonesToHeatmapPoints(zones: ZoneDensity[]): HeatmapPoint[] {
  return zones.map((zone) => ({
    lat: zone.latitude,
    lng: zone.longitude,
    weight: zone.density,
  }));
}

export function severityToColor(severity: ZoneDensity["severity"]): string {
  const colors: Record<ZoneDensity["severity"], string> = {
    low: "#22c55e",
    moderate: "#f59e0b",
    high: "#f97316",
    critical: "#ef4444",
  };
  return colors[severity];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function calculateDensity(count: number, capacity: number): number {
  if (capacity <= 0) return 0;
  return clamp(count / capacity, 0, 1);
}

export function densityToSeverity(density: number): ZoneDensity["severity"] {
  if (density > 0.9) return "critical";
  if (density > 0.75) return "high";
  if (density > 0.5) return "moderate";
  return "low";
}

/** Returns distance in metres between two lat/lng points (Haversine formula). */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth radius in metres
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
