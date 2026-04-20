"use client";

import type { ZoneDensity } from "@/types";

interface DensityChartProps {
  zones: ZoneDensity[];
}

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-green-500",
  moderate: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

const SEVERITY_TEXT: Record<string, string> = {
  low: "severity-low",
  moderate: "severity-moderate",
  high: "severity-high",
  critical: "severity-critical",
};

export function DensityChart({ zones }: DensityChartProps) {
  if (!zones.length) {
    return (
      <div className="py-12 text-center text-[#404060] text-sm">
        No zone data available
      </div>
    );
  }

  const sorted = [...zones].sort((a, b) => b.density - a.density);

  return (
    <div className="space-y-4" role="list" aria-label="Zone density chart">
      {sorted.map((zone) => {
        const pct = Math.round(zone.density * 100);
        const barColor = SEVERITY_COLORS[zone.severity] ?? "bg-gray-500";
        const textColor = SEVERITY_TEXT[zone.severity] ?? "text-gray-400";

        return (
          <div key={zone.id} className="group" role="listitem">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${barColor}`} />
                <span className="text-sm font-medium text-[#e8e8f0] truncate max-w-[180px]">
                  {zone.name}
                </span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-xs text-[#7070a0]">
                  <span className="font-mono">{zone.currentCount}</span>
                  <span className="text-[#404060]"> / {zone.capacity}</span>
                </span>
                <span className={`text-xs font-bold capitalize ${textColor} w-16 text-right`}>
                  {zone.severity}
                </span>
                <span className="font-mono text-sm font-bold text-[#e8e8f0] w-10 text-right">
                  {pct}%
                </span>
              </div>
            </div>

            <div className="density-bar">
              <div
                className={`density-fill ${barColor} relative`}
                style={{ width: `${pct}%` }}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${zone.name} density: ${pct}%`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
