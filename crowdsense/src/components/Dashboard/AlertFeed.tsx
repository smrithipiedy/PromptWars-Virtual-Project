"use client";

import type { CrowdAlert } from "@/types";
import { AlertTriangle, CheckCircle2, Info, X, ChevronRight } from "lucide-react";
import { clsx } from "clsx";

const SEVERITY_CONFIG = {
  critical: {
    badge: "badge-red",
    border: "border-red-500/15",
    bg: "bg-red-500/5",
    icon: AlertTriangle,
    iconColor: "text-red-400",
    dot: "bg-red-500",
    label: "Critical",
  },
  high: {
    badge: "badge-orange",
    border: "border-orange-500/15",
    bg: "bg-orange-500/5",
    icon: AlertTriangle,
    iconColor: "text-orange-400",
    dot: "bg-orange-500",
    label: "High",
  },
  moderate: {
    badge: "badge-orange",
    border: "border-yellow-500/15",
    bg: "bg-yellow-500/5",
    icon: Info,
    iconColor: "text-yellow-400",
    dot: "bg-yellow-500",
    label: "Moderate",
  },
  low: {
    badge: "badge-green",
    border: "border-green-500/15",
    bg: "bg-green-500/5",
    icon: CheckCircle2,
    iconColor: "text-green-400",
    dot: "bg-green-500",
    label: "Low",
  },
};

interface AlertFeedProps {
  alerts: CrowdAlert[];
  readOnly?: boolean;
  onDismiss?: (id: string) => void;
}

export function AlertFeed({ alerts, readOnly, onDismiss }: AlertFeedProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center mb-3">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        </div>
        <p className="text-sm font-semibold text-[#e8e8f0]">All clear</p>
        <p className="text-xs text-[#7070a0] mt-1">No active safety alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" role="list" aria-label="Safety alerts">
      {alerts.map((alert) => {
        const cfg = SEVERITY_CONFIG[alert.severity] ?? SEVERITY_CONFIG.low;
        const Icon = cfg.icon;

        return (
          <div
            key={alert.id}
            className={clsx(
              "relative rounded-xl border p-4 transition-all duration-200 group",
              cfg.border, cfg.bg
            )}
            role="listitem"
          >
            {/* Severity dot */}
            <div className="flex items-start gap-3">
              <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${cfg.dot}`} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                  <span className="text-xs font-semibold text-[#e8e8f0] truncate">{alert.zoneName}</span>
                </div>
                <p className="text-xs text-[#7070a0] leading-relaxed">{alert.message}</p>
                {alert.suggestion && (
                  <p className="text-xs text-[#404060] leading-relaxed mt-1.5 flex items-start gap-1.5">
                    <ChevronRight className="w-3 h-3 mt-0.5 shrink-0 text-[#404060]" />
                    {alert.suggestion}
                  </p>
                )}
              </div>

              {!readOnly && onDismiss && (
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/5 text-[#404060] hover:text-[#7070a0] shrink-0"
                  aria-label={`Dismiss alert for ${alert.zoneName}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
