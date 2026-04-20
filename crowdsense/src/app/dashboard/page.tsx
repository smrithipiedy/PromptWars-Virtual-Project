"use client";

import { useState } from "react";
import {
  RefreshCw, Activity, Shield, Users, AlertTriangle,
  Bell, TrendingUp, MapPin, Globe, LayoutGrid,
  CheckCircle, Building2, Zap
} from "lucide-react";
import { useVenue } from "@/context/VenueContext";
import { logger } from "@/lib/logger";
import { DensityChart } from "@/components/Dashboard/DensityChart";
import { AlertFeed } from "@/components/Dashboard/AlertFeed";
import Link from "next/link";

function StatCard({
  icon: Icon, label, value, sub, color = "text-blue-400", bg = "bg-blue-500/10"
}: {
  icon: any; label: string; value: string | number; sub?: string;
  color?: string; bg?: string;
}) {
  return (
    <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 flex items-start gap-4 hover:border-white/10 transition-all">
      <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-2xl font-black tracking-tight ${color}`}>{value}</p>
        <p className="text-xs font-semibold text-[#7070a0] mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-[#404060] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, sub, badge }: { icon: any; title: string; sub?: string; badge?: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-[#7070a0]" />
        <div>
          <h2 className="font-bold text-sm text-[#e8e8f0]">{title}</h2>
          {sub && <p className="text-[10px] text-[#404060] font-black uppercase tracking-widest mt-0.5">{sub}</p>}
        </div>
      </div>
      {badge}
    </div>
  );
}

export default function DashboardPage() {
  const { zones, alerts, stats, isLoadingLive, refreshAI, venue, analysis } = useVenue();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try { await refreshAI(); }
    finally { setIsRefreshing(false); }
  };

  // Merge floor plan zone metadata with live density data
  const enrichedZones = zones.map(liveZone => {
    const fpZone = analysis?.zones.find(
      z => z.name.toLowerCase() === liveZone.name.toLowerCase()
    );
    return { ...liveZone, capacity: fpZone?.estimatedCapacity ?? liveZone.capacity };
  });

  const totalCapacity = analysis?.totalCapacity ?? null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#04040a] text-white">
      <div className="fixed inset-0 grid-bg-fine opacity-20 pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-8">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-green-500">Live Telemetry</span>
            </div>
            <h1 className="text-[clamp(22px,3vw,36px)] font-black tracking-tight gradient-text-white">
              Operations Dashboard
            </h1>
            {venue && (
              <div className="mt-1.5 flex flex-col gap-1.5">
                <p className="text-xs text-[#7070a0] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  Venue: <span className="font-semibold text-[#e8e8f0]">{venue.venueName}</span>
                  {venue.verified && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-400 uppercase tracking-tighter ml-1">
                      <CheckCircle className="w-2.5 h-2.5" /> Verified
                    </span>
                  )}
                  {venue.formattedAddress && (
                    <span className="text-[#404060]">· {venue.formattedAddress}</span>
                  )}
                </p>
                {venue.verified?.rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-[10px] ${i < Math.floor(venue.verified!.rating!) ? "text-yellow-500" : "text-[#202030]"}`}>★</span>
                    ))}
                    <span className="text-[10px] text-[#404060] font-bold ml-1">Google Maps Rating: {venue.verified.rating}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!venue && (
              <Link href="/analyzer" className="btn-secondary !py-2 !px-4 text-xs">
                <Globe className="w-3.5 h-3.5" />
                Load Floor Plan
              </Link>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-secondary group"
              aria-label="Sync AI analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
              {isRefreshing ? "Syncing…" : "Sync AI"}
            </button>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={Users}
            label="Total Attendees"
            value={stats.totalAttendees.toLocaleString()}
            sub={totalCapacity ? `${Math.round((stats.totalAttendees / totalCapacity) * 100)}% of venue capacity` : undefined}
            color="text-blue-400"
            bg="bg-blue-500/10"
          />
          <StatCard
            icon={AlertTriangle}
            label="Critical Zones"
            value={stats.criticalZones}
            sub={stats.criticalZones > 0 ? "Immediate attention needed" : "All zones nominal"}
            color={stats.criticalZones > 0 ? "text-red-400" : "text-green-400"}
            bg={stats.criticalZones > 0 ? "bg-red-500/10" : "bg-green-500/10"}
          />
          <StatCard
            icon={Bell}
            label="Active Alerts"
            value={stats.activeAlerts}
            sub={stats.activeAlerts > 0 ? "Gemini AI generated" : "No active alerts"}
            color={stats.activeAlerts > 0 ? "text-orange-400" : "text-green-400"}
            bg="bg-orange-500/10"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Density"
            value={`${(stats.averageDensity * 100).toFixed(1)}%`}
            sub={stats.averageDensity > 0.75 ? "⚠ High — take action" : stats.averageDensity > 0.5 ? "Moderate — monitor closely" : "Safe levels"}
            color={stats.averageDensity > 0.75 ? "text-red-400" : stats.averageDensity > 0.5 ? "text-yellow-400" : "text-green-400"}
            bg="bg-violet-500/10"
          />
        </div>

        {/* ── Internet Insights / Intelligence Row ── */}
        {venue?.internetInsights && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500/5 to-violet-500/5 border border-blue-500/20 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe className="w-12 h-12 text-blue-400" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Venue Intelligence</p>
              <h3 className="text-sm font-bold text-white mb-2">Typical Crowd Pattern</h3>
              <p className="text-xs text-[#7070a0] leading-relaxed italic">
                "{venue.internetInsights.typicalCrowdPattern}"
              </p>
              <div className="flex gap-2 mt-4">
                <span className="badge badge-blue">Peak: {venue.internetInsights.peakHours}</span>
                <span className="badge badge-violet">{venue.internetInsights.venueType}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/5 to-red-500/5 border border-orange-500/20 rounded-2xl p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="w-12 h-12 text-orange-400" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400 mb-2">Safety Context</p>
              <h3 className="text-sm font-bold text-white mb-2">Historical Considerations</h3>
              <div className="space-y-1.5">
                {venue.internetInsights.historicalSafetyIssues.map((issue: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-orange-400 rounded-full" />
                    <span className="text-[11px] text-[#7070a0]">{issue}</span>
                  </div>
                ))}
                {venue.internetInsights.historicalSafetyIssues.length === 0 && (
                  <p className="text-xs text-[#404060]">No critical historical safety issues identified.</p>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

          {/* Zone density chart — 8 cols */}
          <div className="xl:col-span-8 bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden flex flex-col">
            <SectionHeader
              icon={Activity}
              title="Zone Density Breakdown"
              sub="Spatial intelligence · Live"
              badge={
                <div className="badge badge-blue">
                  <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                  Live
                </div>
              }
            />
            <div className="flex-1 p-6">
              {isLoadingLive ? (
                <div className="space-y-4 animate-pulse">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-white/[0.03] rounded-xl" />)}
                </div>
              ) : (
                <DensityChart zones={enrichedZones} />
              )}
            </div>
          </div>

          {/* Alert feed — 4 cols */}
          <div className="xl:col-span-4 bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden flex flex-col">
            <SectionHeader
              icon={Shield}
              title="Safety Alerts"
              sub="Gemini AI monitor"
              badge={alerts.length > 0 ? <span className="badge badge-red">{alerts.length}</span> : undefined}
            />
            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin max-h-96">
              <AlertFeed alerts={alerts} onDismiss={(id) => logger.debug("alert_dismissed", { id })} />
            </div>
          </div>

          {/* Floor plan details — shown if fpData exists */}
          {analysis && (
            <>
              {/* Analyzed zones categorized — 6 cols */}
              <div className="xl:col-span-6 bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden flex flex-col">
                <SectionHeader
                  icon={LayoutGrid}
                  title="Venue Sections"
                  sub="Categorized functional zones"
                  badge={<span className="badge badge-blue">{analysis.zones.length} sections</span>}
                />
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                  {/* Group zones by category */}
                  {Object.entries(
                    analysis.zones.reduce((acc, zone) => {
                      const cat = zone.category || "General";
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(zone);
                      return acc;
                    }, {} as Record<string, any[]>)
                  ).map(([category, zonesInCategory]) => (
                    <div key={category} className="mb-4 last:mb-0">
                      <div className="px-5 py-2 bg-white/[0.03] border-y border-border-subtle flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{category}</span>
                        <span className="text-[10px] text-[#404060] font-bold">
                          {analysis.categoryStats?.[category]?.totalCapacity ?? 
                           zonesInCategory.reduce((sum, z) => sum + z.estimatedCapacity, 0)} CAP
                        </span>
                      </div>
                      <div className="divide-y divide-border-subtle/50">
                        {zonesInCategory.map((zone, i) => {
                          const live = zones.find(z => z.name.toLowerCase() === zone.name.toLowerCase());
                          const pct = live ? Math.round(live.density * 100) : null;
                          const col = live?.severity === "critical" ? "bg-red-500" : live?.severity === "high" ? "bg-orange-500" : live?.severity === "moderate" ? "bg-yellow-500" : "bg-green-500";
                          return (
                            <div key={i} className="px-5 py-2.5 flex items-center gap-4 hover:bg-white/[0.01] transition-colors">
                              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                zone.type === "stage" ? "bg-red-500" : zone.type === "food" ? "bg-orange-500" : zone.type === "entry" || zone.type === "exit" ? "bg-green-500" : "bg-blue-500"
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-[#e8e8f0] truncate">{zone.name}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                {pct !== null && (
                                  <span className="text-[10px] font-mono text-[#7070a0]">{pct}%</span>
                                )}
                                <p className="text-xs font-mono font-bold text-blue-400 w-12 text-right">{zone.estimatedCapacity}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations + metrics — 6 cols */}
              <div className="xl:col-span-6 bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden flex flex-col">
                <SectionHeader icon={Zap} title="AI Safety Recommendations" sub="Based on floor plan analysis" />

                {/* Metrics strip */}
                <div className="grid grid-cols-3 divide-x divide-border-subtle border-b border-border-subtle">
                  {[
                    { l: "Total Capacity", v: analysis.totalCapacity.toLocaleString() },
                    { l: "Emergency Exits", v: analysis.emergencyExits },
                    { l: "Accessibility", v: `${analysis.accessibilityScore}%` },
                  ].map(m => (
                    <div key={m.l} className="px-4 py-3 text-center">
                      <p className="text-base font-black text-[#e8e8f0]">{m.v}</p>
                      <p className="text-[10px] text-[#404060] font-black uppercase tracking-widest mt-0.5">{m.l}</p>
                    </div>
                  ))}
                </div>

                {/* Accessibility bar */}
                <div className="px-5 py-3 border-b border-border-subtle">
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${analysis.accessibilityScore >= 80 ? "bg-green-500" : analysis.accessibilityScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${analysis.accessibilityScore}%` }}
                    />
                  </div>
                </div>

                {/* Recommendations list */}
                <div className="flex-1 overflow-y-auto p-5 space-y-2.5 scrollbar-thin">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-border-subtle hover:border-green-500/20 transition-colors group">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-[#7070a0] leading-relaxed group-hover:text-[#e8e8f0] transition-colors">{rec}</p>
                    </div>
                  ))}
                  {analysis.recommendations.length === 0 && (
                    <p className="text-xs text-[#404060] text-center py-6">No recommendations generated</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Venue CTA when no floor plan */}
          {!analysis && (
            <div className="xl:col-span-12">
              <div className="rounded-2xl border border-dashed border-white/[0.08] p-10 flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-[#404060]" />
                </div>
                <div>
                  <p className="font-bold text-[#7070a0]">No venue floor plan loaded</p>
                  <p className="text-sm text-[#404060] mt-1 max-w-md">
                    Upload and analyze your venue's floor plan to see zone breakdowns, capacity data, and AI safety recommendations directly in this dashboard.
                  </p>
                </div>
                <Link href="/analyzer" className="btn-primary !py-2.5 !px-6 text-sm">
                  <Globe className="w-4 h-4" />
                  Analyze Floor Plan
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
