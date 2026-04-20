"use client";

import type { OrganizerStats } from "@/types";
import { Users, AlertTriangle, Bell, Activity } from "lucide-react";

const CARDS = [
  {
    key: "totalAttendees" as const,
    label: "Total Attendees",
    icon: Users,
    color: "text-blue-400",
    iconBg: "bg-blue-400/8",
    format: (v: number) => v.toLocaleString(),
    ariaLabel: (v: number) => `${v} total attendees`,
  },
  {
    key: "criticalZones" as const,
    label: "Critical Zones",
    icon: AlertTriangle,
    color: (v: number) => v > 0 ? "text-red-400" : "text-green-400",
    iconBg: (v: number) => v > 0 ? "bg-red-400/8" : "bg-green-400/8",
    format: (v: number) => String(v),
    ariaLabel: (v: number) => `${v} critical zones`,
  },
  {
    key: "activeAlerts" as const,
    label: "Active Alerts",
    icon: Bell,
    color: (v: number) => v > 0 ? "text-orange-400" : "text-green-400",
    iconBg: "bg-orange-400/8",
    format: (v: number) => String(v),
    ariaLabel: (v: number) => `${v} active alerts`,
  },
  {
    key: "averageDensity" as const,
    label: "Avg Density",
    icon: Activity,
    color: (v: number) => v > 0.75 ? "text-red-400" : v > 0.5 ? "text-yellow-400" : "text-green-400",
    iconBg: "bg-violet-400/8",
    format: (v: number) => `${(v * 100).toFixed(1)}%`,
    ariaLabel: (v: number) => `average density ${(v * 100).toFixed(1)} percent`,
  },
];

export function StatsPanel({ stats }: { stats: OrganizerStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Event statistics">
      {CARDS.map(({ key, label, icon: Icon, color, iconBg, format, ariaLabel }) => {
        const value = stats[key];
        const colorClass = typeof color === "function" ? color(value) : color;
        const bgClass = typeof iconBg === "function" ? iconBg(value) : iconBg;

        return (
          <div
            key={key}
            className="stat-card group relative overflow-hidden"
            aria-label={ariaLabel(value)}
          >
            {/* Subtle gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />

            <div className="relative flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${bgClass}`}>
                <Icon className={`w-4 h-4 ${colorClass}`} />
              </div>
            </div>

            <div className="relative">
              <p className={`text-3xl font-black tracking-tight ${colorClass}`}>
                {format(value)}
              </p>
              <p className="text-xs text-[#7070a0] font-medium mt-1">{label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
