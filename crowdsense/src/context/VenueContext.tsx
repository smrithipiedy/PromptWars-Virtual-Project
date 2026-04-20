"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useFloorPlanData } from "@/hooks/useFloorPlanData";
import { useCrowdData } from "@/hooks/useCrowdData";
import type { FloorPlanAnalysis, VenueLocation, ZoneDensity, CrowdAlert, OrganizerStats } from "@/types";

interface VenueContextType {
  // Static Venue Data
  venue: VenueLocation | null;
  analysis: FloorPlanAnalysis | null;
  isLoadingVenue: boolean;
  
  // Live Crowd Data
  zones: ZoneDensity[];
  alerts: CrowdAlert[];
  stats: OrganizerStats;
  isLoadingLive: boolean;
  
  // Actions
  refreshAI: () => Promise<void>;
  clearAll: () => void;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

export function VenueProvider({ children }: { children: React.ReactNode }) {
  const { data: fpData, isLoading: isLoadingVenue, clearData } = useFloorPlanData();
  const { zones, alerts, stats, loading: isLoadingLive, refreshAIAnalysis } = useCrowdData();

  const value: VenueContextType = {
    venue: fpData?.venue ?? null,
    analysis: fpData?.analysis ?? null,
    isLoadingVenue,
    zones,
    // Only surface alerts once a venue has been loaded
    alerts: fpData ? alerts : [],
    stats,
    isLoadingLive,
    refreshAI: refreshAIAnalysis,
    clearAll: clearData,
  };

  return <VenueContext.Provider value={value}>{children}</VenueContext.Provider>;
}

export function useVenue() {
  const context = useContext(VenueContext);
  if (context === undefined) {
    throw new Error("useVenue must be used within a VenueProvider");
  }
  return context;
}
