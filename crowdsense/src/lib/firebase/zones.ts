import { subscribeToZoneDensity } from "./firestore";
import type { ZoneDensity } from "@/types";

/**
 * Subscribe to real-time zone density updates
 * @param callback Function called whenever zone data updates
 * @returns Unsubscribe function
 */
export function subscribeToZones(
  callback: (zones: ZoneDensity[]) => void
): () => void {
  return subscribeToZoneDensity(callback);
}
