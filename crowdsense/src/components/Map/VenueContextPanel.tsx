"use client";

import { useState, useEffect, useCallback } from "react";
import { useFloorPlanData } from "@/hooks/useFloorPlanData";
import { haversineDistance } from "@/lib/maps/helpers";
import {
  MapPin, Loader2, Navigation, Star, CheckCircle,
  AlertTriangle, Info, ShieldCheck, Route, Clock,
  ShoppingBag, ChevronRight, RefreshCw, ThumbsUp,
  ThumbsDown, Lightbulb, CheckCircle2
} from "lucide-react";

type LocationContext = "detecting" | "no_venue" | "at_venue" | "away";
type UserChoice = null | "visited" | "planning_visit";
type AiStatus = "idle" | "loading" | "done" | "error";

const ICON_MAP: Record<string, any> = {
  bag: ShoppingBag, route: Route, shield: ShieldCheck, clock: Clock,
};

interface Props {
  userLat: number | null;
  userLng: number | null;
}

export function VenueContextPanel({ userLat, userLng }: Props) {
  const { data: fpData } = useFloorPlanData();

  // ── Location detection (purely derived from GPS, never overwritten by user action)
  const [locationCtx, setLocationCtx] = useState<LocationContext>("detecting");

  // ── What the user explicitly chose to do (locked in once set)
  const [userChoice, setUserChoice] = useState<UserChoice>(null);

  // ── AI state
  const [aiStatus, setAiStatus] = useState<AiStatus>("idle");
  const [aiData, setAiData] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // ── Review form state
  const [starRating, setStarRating] = useState(0);
  const [corrections, setCorrections] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Determine location context — runs whenever GPS or venue changes
  useEffect(() => {
    if (!fpData) { setLocationCtx("no_venue"); return; }
    if (userLat === null || userLng === null) { setLocationCtx("detecting"); return; }

    const vLat = fpData.venue.latitude;
    const vLng = fpData.venue.longitude;
    if (!vLat || !vLng) { setLocationCtx("away"); return; }

    const dist = haversineDistance(userLat, userLng, vLat, vLng);
    setLocationCtx(dist <= 300 ? "at_venue" : "away");
  }, [userLat, userLng, fpData]);

  // Auto-call AI when at venue (and user hasn't made a manual choice)
  const callAssistant = useCallback(async (scenario: string) => {
    if (!fpData) return;
    setAiStatus("loading");
    setAiError(null);
    try {
      const res = await fetch("/api/venue-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          venueName: fpData.venue.venueName,
          venueAddress: fpData.venue.formattedAddress || fpData.venue.address,
          floorPlanZones: fpData.analysis.zones,
          recommendations: fpData.analysis.recommendations,
          accessibilityScore: fpData.analysis.accessibilityScore,
          totalCapacity: fpData.analysis.totalCapacity,
        }),
      });
      const json = await res.json();
      if (json.success) { setAiData(json.data); setAiStatus("done"); }
      else { setAiError(json.error || "AI unavailable"); setAiStatus("error"); }
    } catch {
      setAiError("Connection error — please try again.");
      setAiStatus("error");
    }
  }, [fpData]);

  // Auto-trigger when at_venue (only once, and only if user hasn't chosen something)
  useEffect(() => {
    if (locationCtx === "at_venue" && !userChoice && aiStatus === "idle") {
      callAssistant("at_venue");
    }
  }, [locationCtx, userChoice, aiStatus, callAssistant]);

  // Handler when user clicks one of the choice buttons
  const handleUserChoice = (choice: "visited" | "planning_visit") => {
    setUserChoice(choice);
    setAiData(null);
    setAiStatus("idle");
    callAssistant(choice);
  };

  // ── CASES ──────────────────────────────────────────────

  if (locationCtx === "no_venue") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-4 py-12">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center">
          <Navigation className="w-6 h-6 text-[#404060]" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#7070a0]">No venue loaded</p>
          <p className="text-xs text-[#404060] mt-1 max-w-[200px]">Analyze a floor plan first to unlock AI insights.</p>
        </div>
        <a href="/analyzer" className="btn-primary !py-2 !px-4 text-xs">Open Analyzer</a>
      </div>
    );
  }

  if (locationCtx === "detecting") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 px-4 py-12 text-center">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        <p className="text-sm font-semibold text-[#7070a0]">Pinpointing your location…</p>
      </div>
    );
  }

  if (aiStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-4 py-12 text-center">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" />
          <Loader2 className="w-7 h-7 text-blue-400 animate-spin" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Gemini AI thinking…</p>
          <p className="text-xs text-[#7070a0] mt-1">Generating personalised insights</p>
        </div>
      </div>
    );
  }

  if (aiStatus === "error") {
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
        <AlertTriangle className="w-8 h-8 text-orange-400" />
        <p className="text-sm text-[#7070a0]">{aiError}</p>
        <button onClick={() => { setAiStatus("idle"); handleUserChoice(userChoice ?? "planning_visit"); }} className="btn-secondary text-xs !py-2 !px-4">
          <RefreshCw className="w-3 h-3" /> Try again
        </button>
      </div>
    );
  }

  /* ── Location chooser (away from venue, no choice yet) ── */
  if (!userChoice && locationCtx === "away") {
    const venue = fpData!.venue;
    return (
      <div className="space-y-4 p-1">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-border-subtle">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#404060] mb-1">Analysed venue</p>
          <p className="text-sm font-bold text-white">{venue.venueName}</p>
          {venue.formattedAddress && <p className="text-xs text-[#7070a0] mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3 shrink-0" />{venue.formattedAddress}</p>}
        </div>

        <p className="text-sm font-semibold text-[#e8e8f0] px-1">
          Have you visited <span className="text-blue-400">{venue.venueName}</span> before, or are you planning to?
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleUserChoice("visited")}
            className="group w-full flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-border-subtle hover:border-blue-500/30 hover:bg-blue-500/[0.06] transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] group-hover:bg-blue-500/20 flex items-center justify-center transition-colors shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#7070a0] group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#e8e8f0]">I've been there</p>
              <p className="text-xs text-[#7070a0] mt-0.5">Confirm details &amp; leave a review</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#404060] group-hover:text-blue-400 transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => handleUserChoice("planning_visit")}
            className="group w-full flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-border-subtle hover:border-violet-500/30 hover:bg-violet-500/[0.06] transition-all text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] group-hover:bg-violet-500/20 flex items-center justify-center transition-colors shrink-0">
              <Navigation className="w-4 h-4 text-[#7070a0] group-hover:text-violet-400 transition-colors" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#e8e8f0]">I'm planning to visit</p>
              <p className="text-xs text-[#7070a0] mt-0.5">Get precautionary tips &amp; advice</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#404060] group-hover:text-violet-400 transition-colors" />
          </button>
        </div>
      </div>
    );
  }

  /* ── AT VENUE insights ── */
  if (locationCtx === "at_venue" && !userChoice && aiStatus === "done" && aiData) {
    return (
      <div className="space-y-4 p-1">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">You are here</p>
            <p className="text-sm font-bold text-white">{fpData!.venue.venueName}</p>
            <p className="text-xs text-[#7070a0] mt-1 leading-relaxed">{aiData.greeting}</p>
          </div>
        </div>
        <div className="space-y-3">
          {aiData.insights?.map((ins: any, i: number) => {
            const Icon = ins.type === "warning" ? AlertTriangle : ins.type === "tip" ? Lightbulb : Info;
            const cls = ins.type === "warning" ? { icon: "text-orange-400", border: "border-orange-500/20", bg: "bg-orange-500/[0.06]" }
              : ins.type === "tip" ? { icon: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/[0.06]" }
              : { icon: "text-cyan-400", border: "border-cyan-500/20", bg: "bg-cyan-500/[0.06]" };
            return (
              <div key={i} className={`p-3.5 rounded-xl border ${cls.border} ${cls.bg}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${cls.icon}`} />
                  <p className="text-xs font-black text-white">{ins.title}</p>
                </div>
                <p className="text-xs text-[#7070a0] leading-relaxed">{ins.body}</p>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => { setAiData(null); setAiStatus("idle"); }}
            className="btn-ghost flex-1 justify-center !py-2 text-xs"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
          <button
            type="button"
            onClick={() => handleUserChoice("visited")}
            className="btn-ghost flex-1 justify-center !py-2 text-xs"
          >
            Leave a review
          </button>
        </div>
      </div>
    );
  }

  /* ── VISITED: review form ── */
  if (userChoice === "visited" && aiStatus === "done" && aiData && !submitted) {
    return (
      <div className="space-y-4 p-1">
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-[#e8e8f0] leading-relaxed">{aiData.greeting}</p>
        </div>
        <div className="space-y-4">
          {aiData.questions?.map((q: any) => (
            <div key={q.id} className="space-y-2">
              <p className="text-xs font-semibold text-[#e8e8f0]">{q.question}</p>
              {q.type === "yesno" && (
                <div className="flex gap-2">
                  <button className="btn-secondary !py-1.5 !px-3 text-xs flex-1 justify-center"><ThumbsUp className="w-3 h-3" />Yes</button>
                  <button className="btn-secondary !py-1.5 !px-3 text-xs flex-1 justify-center"><ThumbsDown className="w-3 h-3" />No</button>
                </div>
              )}
              {q.type === "stars" && (
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setStarRating(s)}>
                      <Star className={`w-5 h-5 transition-colors ${s <= starRating ? "text-yellow-400 fill-yellow-400" : "text-[#404060]"}`} />
                    </button>
                  ))}
                </div>
              )}
              {q.type === "text" && (
                <textarea value={corrections} onChange={e => setCorrections(e.target.value)} placeholder="Any corrections or notes…" className="input-field resize-none h-20 text-xs" />
              )}
              {q.type === "scale" && (
                <div className="flex gap-1">
                  {["Light","Moderate","Busy","Very Busy","Packed"].map(l => (
                    <button key={l} className="flex-1 text-[9px] px-1 py-1.5 rounded-lg bg-white/[0.03] border border-border-subtle hover:border-blue-500/30 hover:text-blue-400 transition-all font-bold">{l}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <button onClick={() => setSubmitted(true)} className="btn-primary w-full justify-center !py-2.5 text-sm">
          <CheckCircle className="w-4 h-4" />Submit Review
        </button>
      </div>
    );
  }

  /* ── Submitted ── */
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-4 py-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-400" />
        </div>
        <p className="text-sm font-bold text-white">Thank you!</p>
        <p className="text-xs text-[#7070a0]">Your review helps improve our AI accuracy.</p>
      </div>
    );
  }

  /* ── PLANNING VISIT: advice cards ── */
  if (userChoice === "planning_visit" && aiStatus === "done" && aiData) {
    return (
      <div className="space-y-4 p-1">
        <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-1">Pre-Visit Guide</p>
          <p className="text-sm text-[#e8e8f0] leading-relaxed">{aiData.greeting}</p>
        </div>
        <div className="space-y-3">
          {aiData.advice?.map((sec: any, i: number) => {
            const Icon = ICON_MAP[sec.icon] || Info;
            return (
              <div key={i} className="rounded-xl bg-white/[0.02] border border-border-subtle overflow-hidden">
                <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-violet-400" />
                  <p className="text-xs font-black text-white">{sec.category}</p>
                </div>
                <ul className="p-3 space-y-2">
                  {sec.tips?.map((tip: string, j: number) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-[#7070a0] leading-relaxed">
                      <ChevronRight className="w-3 h-3 text-violet-400 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <button onClick={() => { setUserChoice(null); setAiData(null); setAiStatus("idle"); }} className="btn-ghost w-full justify-center !py-2 text-xs">
          <RefreshCw className="w-3 h-3" />Start over
        </button>
      </div>
    );
  }

  return null;
}
