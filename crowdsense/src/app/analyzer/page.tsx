"use client";

import { ScanLine } from "lucide-react";
import { FloorPlanAnalyzer } from "@/components/FloorPlan/FloorPlanAnalyzer";

export default function AnalyzerPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#04040a] text-white">
      <div className="fixed inset-0 grid-bg-fine opacity-30 pointer-events-none" aria-hidden="true" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-700/5 blur-[120px] pointer-events-none" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">

        {/* Page header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full bg-blue-500/[0.08] border border-blue-500/20 text-xs font-black uppercase tracking-widest text-blue-400">
            <ScanLine className="w-3.5 h-3.5" />
            Venue Intelligence
          </div>
          <h1 className="text-[clamp(28px,4vw,48px)] font-black tracking-tight gradient-text-white leading-tight mb-3">
            Floor Plan Analyzer
          </h1>
          <p className="text-[#7070a0] text-base max-w-xl">
            Upload your venue layout and Gemini Vision automatically identifies the location, detects zones, calculates capacities, and provides safety recommendations.
          </p>
        </div>

        {/* Analyzer component */}
        <FloorPlanAnalyzer />
      </div>
    </div>
  );
}
