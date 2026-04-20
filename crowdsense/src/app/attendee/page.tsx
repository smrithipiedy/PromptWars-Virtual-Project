"use client";

import React, { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useVenue } from "@/context/VenueContext";
import { useGeolocation } from "@/hooks/useGeolocation";
import { AlertFeed } from "@/components/Dashboard/AlertFeed";
import { VenueContextPanel } from "@/components/Map/VenueContextPanel";
import { MapChatbot, PinnedLocation } from "@/components/Map/MapChatbot";
import { MapPin, Signal, Shield, Bell, Brain, Navigation2 } from "lucide-react";

const CrowdHeatmap = dynamic(
  () => import("@/components/Map/CrowdHeatmap").then((m) => m.CrowdHeatmap),
  { ssr: false, loading: () => <div className="w-full h-full bg-[#04040a]" /> }
);

type TabId = "assistant" | "alerts";

export default function AttendeePage() {
  const { zones, alerts, isLoadingLive } = useVenue();
  const [activeTab, setActiveTab] = useState<TabId>("assistant");
  const [pinnedLocations, setPinnedLocations] = useState<PinnedLocation[]>([]);

  const { location, error: geoError, loading: geoLoading } = useGeolocation();

  const handlePinLocation = useCallback((pin: PinnedLocation) => {
    setPinnedLocations(prev => [...prev, pin]);
  }, []);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "assistant", label: "AI Guide" },
    { id: "alerts",    label: "Alerts", count: alerts.length > 0 ? alerts.length : undefined },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#04040a]">

      {/* ── Map area ── */}
      <div className="flex-1 relative min-w-0">
        {isLoadingLive ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#04040a]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
              <p className="text-[#7070a0] text-sm font-semibold">Connecting to live map…</p>
            </div>
          </div>
        ) : (
          <CrowdHeatmap
            zones={zones}
            userLocation={location ?? undefined}
            pinnedLocations={pinnedLocations}
          />
        )}

        {/* Chatbot — mounted over map */}
        <MapChatbot
          userLat={location?.lat ?? null}
          userLng={location?.lng ?? null}
          zones={zones}
          onPinLocation={handlePinLocation}
        />

        {/* GPS badge */}
        {location && (
          <div className="absolute bottom-6 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#04040a]/80 border border-white/[0.08] backdrop-blur-md pointer-events-none">
            <div className="relative">
              <span className="w-2 h-2 rounded-full bg-blue-500 block" />
              <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-50" />
            </div>
            <span className="text-xs font-mono text-[#7070a0]">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </div>
        )}

        {geoError && !location && (
          <div className="absolute bottom-6 left-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-md">
            <Navigation2 className="w-3.5 h-3.5 text-red-400" />
            <span className="text-xs text-red-400 font-semibold">Location unavailable</span>
          </div>
        )}
      </div>

      {/* ── Side panel ── */}
      <aside className="w-80 xl:w-96 flex flex-col bg-bg-surface border-l border-border-subtle overflow-hidden shrink-0">

        {/* Tabs */}
        <div className="flex border-b border-border-subtle shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-bold transition-all relative ${
                activeTab === tab.id ? "text-white" : "text-[#7070a0] hover:text-[#e8e8f0]"
              }`}
            >
              {tab.id === "assistant" ? <Brain className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
              {tab.label}
              {tab.count !== undefined && (
                <span className="w-4 h-4 rounded-full bg-red-500 text-[9px] font-black text-white flex items-center justify-center">{tab.count}</span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500" />
              )}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          {activeTab === "assistant" && (
            <VenueContextPanel userLat={location?.lat ?? null} userLng={location?.lng ?? null} />
          )}
          {activeTab === "alerts" && (
            <AlertFeed alerts={alerts} readOnly />
          )}
        </div>

        {/* Pinned locations strip */}
        {pinnedLocations.length > 0 && (
          <div className="border-t border-border-subtle p-3 space-y-1.5 max-h-28 overflow-y-auto scrollbar-thin shrink-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#404060]">Pinned on map</p>
            {pinnedLocations.map(pin => (
              <div key={pin.id} className="flex items-center gap-2 text-xs text-[#7070a0]">
                <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate">{pin.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border-subtle p-3 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#404060]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#404060]">
                {geoLoading ? "Acquiring GPS…" : location ? "Location active" : geoError ? "No access" : "Waiting…"}
              </span>
            </div>
            {location && (
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-green-400 font-black">Anonymous</span>
              </div>
            )}
          </div>
          {location && (
            <p className="text-[9px] text-[#404060] mt-1 flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              No personal data stored · anonymous density only
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
