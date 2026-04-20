"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, Globe, MapPin, CheckCircle, AlertTriangle, X, LayoutGrid, ArrowRight, ImageIcon } from "lucide-react";
import { useFloorPlanData } from "@/hooks/useFloorPlanData";
import { compressImage } from "@/lib/image-utils";
import Image from "next/image";
import { logger } from "@/lib/logger";

export function FloorPlanAnalyzer() {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: floorPlanData, clearData } = useFloorPlanData();

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP, etc.)");
      return;
    }

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    setError(null);

    try {
      // Compress image client-side for Efficiency
      logger.info(`Starting client-side compression for ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
      const base64Data = await compressImage(file);
      const mimeType = "image/jpeg"; // Compression utility converts to jpeg
      logger.info("Compression complete. Sending to Gemini AI...");

      // Single combined API call — halves quota usage
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Data, mimeType }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "AI analysis failed. Please try again.");
      }

      const result = await response.json();
      const venueData = result.venue;
      const planData = result.analysis;

      const fullData = {
        timestamp: new Date().toISOString(),
        analysis: planData,
        venue: venueData,
      };

      localStorage.setItem("floorPlanAnalysis", JSON.stringify(fullData));
      window.dispatchEvent(new CustomEvent("floorPlanUpdated", { detail: fullData }));

      // Background sync
      fetch("/api/venue/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullData),
      }).catch(() => {});
    } catch (err: any) {
      setError(err.message || "Failed to analyze floor plan");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); if (!isUploading) setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    if (!isUploading) { const file = e.dataTransfer.files?.[0]; if (file) processFile(file); }
  };

  const handleClear = () => {
    clearData();
    setPreviewUrl(null);
    setError(null);
  };

  /* ── No result yet: show upload zone ── */
  if (!floorPlanData) {
    return (
      <div className="w-full">
        <div
          role="button"
          tabIndex={0}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onKeyDown={e => e.key === "Enter" && !isUploading && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-label="Upload floor plan image"
          className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 select-none outline-none
            ${isDragging ? "border-blue-500 bg-blue-500/[0.06] scale-[1.01]" : "border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02]"}
            ${isUploading ? "pointer-events-none" : ""}`}
        >
          {/* Animated glow ring when dragging */}
          {isDragging && (
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 blur opacity-30 pointer-events-none" />
          )}

          <div className="relative flex flex-col items-center justify-center gap-5 py-20 px-6 text-center">
            {isUploading ? (
              <>
                <div className="relative">
                  {previewUrl && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/[0.1] mb-2">
                      <img src={previewUrl} alt="Uploading" className="w-full h-full object-cover opacity-60" />
                    </div>
                  )}
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">Gemini AI is analyzing…</p>
                  <p className="text-sm text-[#7070a0] mt-1">Detecting zones, capacity & venue location</p>
                </div>
                <div className="flex gap-2">
                  <span className="badge badge-blue">Venue ID</span>
                  <span className="badge badge-violet">Zone Detection</span>
                  <span className="badge badge-green">Safety Score</span>
                </div>
              </>
            ) : (
              <>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-300 ${isDragging ? "scale-125 bg-blue-500/20" : "bg-white/[0.05]"}`}>
                  {isDragging ? (
                    <ImageIcon className="w-8 h-8 text-blue-400" />
                  ) : (
                    <Upload className="w-8 h-8 text-[#7070a0]" />
                  )}
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {isDragging ? "Drop to analyze" : "Drop your floor plan here"}
                  </p>
                  <p className="text-sm text-[#7070a0] mt-1">or <span className="text-blue-400 font-semibold">click to browse</span> · PNG, JPG, WEBP</p>
                </div>
                <div className="flex gap-2">
                  <span className="badge badge-blue">Gemini 2.0 Vision</span>
                  <span className="badge badge-green">Instant Analysis</span>
                </div>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            aria-hidden="true"
          />
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/[0.06] border border-red-500/20 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    );
  }

  /* ── Results ── */
  const { venue, analysis } = floorPlanData;
  const address = venue.formattedAddress || [venue.address, venue.city, venue.country].filter(Boolean).join(", ");

  return (
    <div className="w-full space-y-5">

      {/* ── Header card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-bg-surface border border-border-subtle">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-black text-lg text-white truncate">{venue.venueName}</h2>
              <span className="badge badge-blue shrink-0">{analysis.totalCapacity} cap.</span>
              <span className="badge badge-green shrink-0">{analysis.emergencyExits} exits</span>
            </div>
            {address && (
              <p className="text-sm text-[#7070a0] mt-0.5 flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 shrink-0" />{address}
              </p>
            )}
          </div>
        </div>
        <button onClick={handleClear} className="btn-ghost !py-2 !px-3 text-xs shrink-0 flex items-center gap-1">
          <X className="w-3.5 h-3.5" />
          New analysis
        </button>
      </div>

      {/* ── 3-col content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Uploaded image preview */}
        {previewUrl && (
          <div className="lg:col-span-4 card">
            <div className="px-5 py-4 border-b border-border-subtle">
              <p className="font-bold text-sm text-[#e8e8f0]">Uploaded Floor Plan</p>
            </div>
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-black/20">
              <img
                src={previewUrl}
                alt="Uploaded venue floor plan"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Zones list — categorized */}
        <div className={`${previewUrl ? "lg:col-span-4" : "lg:col-span-6"} card flex flex-col`}>
          <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-blue-400" />
              <p className="font-bold text-sm text-[#e8e8f0]">Categorized Zones</p>
            </div>
            <span className="badge badge-blue">{analysis.zones.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] scrollbar-thin">
            {Object.entries(
              analysis.zones.reduce((acc, zone) => {
                const cat = zone.category || "General";
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(zone);
                return acc;
              }, {} as Record<string, any[]>)
            ).map(([category, zonesInCategory]) => (
              <div key={category} className="mb-4 last:mb-0">
                <div className="px-5 py-2 bg-white/[0.03] border-y border-border-subtle flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{category}</span>
                  <span className="text-[10px] text-[#7070a0] font-bold">
                    {analysis.categoryStats?.[category]?.totalCapacity ?? 
                     zonesInCategory.reduce((sum, z) => sum + z.estimatedCapacity, 0)} CAP
                  </span>
                </div>
                <div className="divide-y divide-border-subtle/50">
                  {zonesInCategory.map((zone, i) => (
                    <div key={i} className="px-5 py-3 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          zone.type === "stage" ? "bg-red-500" :
                          zone.type === "food"  ? "bg-orange-500" :
                          zone.type === "entry" || zone.type === "exit" ? "bg-green-500" :
                          "bg-blue-500"
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#e8e8f0] truncate">{zone.name}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-mono font-bold text-blue-400">{zone.estimatedCapacity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations + accessibility score */}
        <div className={`${previewUrl ? "lg:col-span-4" : "lg:col-span-6"} card flex flex-col`}>
          <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <p className="font-bold text-sm text-[#e8e8f0]">AI Recommendations</p>
          </div>

          {/* Accessibility score bar */}
          <div className="px-5 py-4 border-b border-border-subtle">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#404060]">Accessibility Score</span>
              <span className={`text-lg font-black ${
                analysis.accessibilityScore >= 80 ? "text-green-400" :
                analysis.accessibilityScore >= 50 ? "text-yellow-400" : "text-red-400"
              }`}>{analysis.accessibilityScore}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  analysis.accessibilityScore >= 80 ? "bg-green-500" :
                  analysis.accessibilityScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${analysis.accessibilityScore}%` }}
              />
            </div>
          </div>

          <div className="p-5 space-y-3 flex-1 overflow-y-auto max-h-64 scrollbar-thin">
            {analysis.recommendations.map((rec, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-border-subtle hover:border-green-500/20 transition-colors group">
                <ArrowRight className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                <p className="text-[13px] text-[#7070a0] leading-relaxed group-hover:text-[#e8e8f0] transition-colors">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
