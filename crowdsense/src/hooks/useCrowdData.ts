"use client";

import { useState, useEffect, useCallback } from "react";
import { subscribeToZoneDensity, subscribeToAlerts } from "@/lib/firebase/firestore";
import { MOCK_ZONES } from "@/lib/constants";
import type { ZoneDensity, CrowdAlert, OrganizerStats } from "@/types";

export function useCrowdData() {
  const [zones, setZones] = useState<ZoneDensity[]>([]);
  const [alerts, setAlerts] = useState<CrowdAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to live data - this is efficient and doesn't loop
  useEffect(() => {
    const unsubZones = subscribeToZoneDensity((liveZones) => {
      setZones(liveZones);
      setLoading(false);
    });
    const unsubAlerts = subscribeToAlerts((liveAlerts) => {
      setAlerts(liveAlerts);
    });

    // Safety fallback: resolve loading if backend takes too long (e.g. empty collection)
    const timeout = setTimeout(() => setLoading(false), 3000);

    return () => {
      unsubZones();
      unsubAlerts();
      clearTimeout(timeout);
    };
  }, []);

  // Action to trigger AI analysis manually or via a separate controller
  const refreshAIAnalysis = useCallback(async () => {
    try {
      await fetch("/api/crowd-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zones }),
      });
    } catch (e) {
      console.error("[useCrowdData] AI analysis failed:", e);
    }
  }, [zones]);

  const stats: OrganizerStats = {
    totalAttendees: zones.reduce((sum, z) => sum + z.currentCount, 0),
    criticalZones: zones.filter((z) => z.severity === "critical").length,
    activeAlerts: alerts.length,
    averageDensity:
      zones.length > 0
        ? zones.reduce((sum, z) => sum + z.density, 0) / zones.length
        : 0,
  };

  return { zones, alerts, stats, loading, refreshAIAnalysis };
}
