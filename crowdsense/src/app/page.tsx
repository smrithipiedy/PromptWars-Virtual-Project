import Link from "next/link";
import { ArrowRight, Zap, Map, Activity, Users, Shield, BarChart3, ChevronRight } from "lucide-react";

const FEATURES = [
  {
    icon: Activity,
    title: "Floor Plan Intelligence",
    desc: "Upload any venue image. Gemini Vision auto-identifies the location, detects zones, estimates per-zone capacity, and issues safety recommendations.",
    color: "text-blue-400",
    glow: "from-blue-600/20 to-transparent",
    link: "/analyzer",
    cta: "Open Analyzer",
  },
  {
    icon: Zap,
    title: "Autonomous AI Alerts",
    desc: "Crowd patterns are continuously analyzed by Gemini AI. When thresholds are breached, actionable safety alerts are generated in real-time.",
    color: "text-violet-400",
    glow: "from-violet-600/20 to-transparent",
    link: "/dashboard",
    cta: "View Dashboard",
  },
  {
    icon: Map,
    title: "Live Event Heatmap",
    desc: "Attendees see a dynamic density overlay on an interactive map, powered by live Firebase telemetry, helping them navigate safely.",
    color: "text-cyan-400",
    glow: "from-cyan-600/20 to-transparent",
    link: "/attendee",
    cta: "Open Live Map",
  },
];

const STATS = [
  { value: "240+", label: "Events monitored" },
  { value: "2M+", label: "Attendees tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "<500ms", label: "Alert latency" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#04040a] text-white overflow-x-hidden">

      {/* ── Ambient orbs ── */}
      <div className="fixed inset-0 pointer-events-none select-none" aria-hidden="true">
        <div className="absolute top-[-30%] left-[-5%] w-[900px] h-[900px] rounded-full bg-blue-700/8 blur-[160px]" />
        <div className="absolute top-[5%] right-[-10%] w-[700px] h-[700px] rounded-full bg-violet-700/8 blur-[140px]" />
        <div className="absolute bottom-[10%] left-[35%] w-[600px] h-[600px] rounded-full bg-cyan-700/5 blur-[140px]" />
      </div>

      {/* ── Grid texture ── */}
      <div className="fixed inset-0 grid-bg pointer-events-none opacity-100" aria-hidden="true" />

      {/* ════════════════════════════════════════════════════ HERO */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-8 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-[#7070a0]">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Powered by Gemini AI · Google Maps
            <span className="w-px h-3 bg-white/10" />
            <span className="text-blue-400 font-bold">v2.0</span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(48px,8vw,104px)] font-black tracking-[-0.04em] leading-[0.88] mb-6">
            <span className="gradient-text-white block">See your crowd.</span>
            <span className="gradient-text block">Stay ahead of it.</span>
          </h1>

          <p className="text-[clamp(16px,2vw,20px)] text-[#7070a0] leading-relaxed max-w-2xl mx-auto mb-10">
            CrowdSense gives event teams real-time crowd density intelligence — from venue floor plan analysis to live heatmaps and autonomous AI safety alerts.
          </p>

          {/* CTA button — centered */}
          <div className="flex justify-center">
            <Link href="/analyzer" className="btn-primary py-3.5 px-10 text-[15px] group">
              <span className="relative z-10 flex items-center gap-2">
                Analyze Your Venue
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative mt-20 flex flex-wrap justify-center gap-x-12 gap-y-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black gradient-text">{s.value}</p>
              <p className="text-xs text-[#404060] font-semibold mt-1 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>


      </section>

      {/* ════════════════════════════════════════════════════ PRODUCT PREVIEW */}
      <section className="relative py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Glowing card */}
          <div className="relative rounded-3xl overflow-hidden glow-border">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5" />
            {/* Fake terminal bar */}
            <div className="relative bg-bg-surface border border-border-subtle rounded-3xl p-1">
              <div className="bg-[#080810] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.04]">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <div className="flex-1 mx-4">
                    <div className="bg-white/[0.04] rounded-md h-6 flex items-center px-3 max-w-[280px] mx-auto">
                      <p className="text-[10px] text-[#404060] font-mono">crowdsense.ai/dashboard</p>
                    </div>
                  </div>
                  <div className="badge badge-green">
                    <span className="w-1 h-1 bg-green-400 rounded-full" />
                    Live
                  </div>
                </div>
                {/* Mock dashboard */}
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { l: "Attendees", v: "4,821", c: "text-blue-400" },
                      { l: "Avg Density", v: "67%", c: "text-yellow-400" },
                      { l: "Critical Zones", v: "1", c: "text-red-400" },
                      { l: "AI Alerts", v: "3", c: "text-violet-400" },
                    ].map(s => (
                      <div key={s.l} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4">
                        <p className="text-[10px] text-[#404060] uppercase font-black tracking-widest mb-2">{s.l}</p>
                        <p className={`text-2xl font-black ${s.c}`}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: "Main Stage", pct: 94, col: "bg-red-500", sev: "Critical" },
                      { name: "Food Court", pct: 71, col: "bg-orange-500", sev: "High" },
                      { name: "Entry Gate A", pct: 48, col: "bg-green-500", sev: "Safe" },
                    ].map(z => (
                      <div key={z.name} className="flex items-center gap-4">
                        <span className="text-sm text-[#7070a0] w-28 shrink-0 font-medium">{z.name}</span>
                        <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                          <div className={`h-full ${z.col} rounded-full transition-all`} style={{ width: `${z.pct}%` }} />
                        </div>
                        <span className="text-xs font-mono text-[#404060] w-9 text-right">{z.pct}%</span>
                        <span className={`text-[10px] font-black w-14 text-right ${z.sev === "Critical" ? "text-red-400" : z.sev === "High" ? "text-orange-400" : "text-green-400"}`}>{z.sev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ FEATURES */}
      <section className="relative py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-16">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#404060] mb-4">Platform</p>
            <h2 className="text-[clamp(32px,5vw,56px)] font-black tracking-tight gradient-text-white leading-tight">
              Three tools, one platform.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="group relative stat-card overflow-hidden cursor-default">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className={`inline-flex w-10 h-10 rounded-xl bg-white/[0.05] items-center justify-center mb-5`}>
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="font-bold text-[#e8e8f0] text-lg mb-3 leading-tight">{f.title}</h3>
                  <p className="text-sm text-[#7070a0] leading-relaxed mb-6">{f.desc}</p>
                  <Link
                    href={f.link}
                    className={`inline-flex items-center gap-1 text-sm font-bold ${f.color} group-hover:gap-2 transition-all`}
                  >
                    {f.cta}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ HOW IT WORKS */}
      <section className="relative py-24 px-4 sm:px-6 border-t border-white/[0.04]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#404060] mb-4">Workflow</p>
          <h2 className="text-[clamp(28px,4vw,48px)] font-black tracking-tight gradient-text-white mb-12">Up and running in minutes.</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Upload your floor plan", desc: "Drag & drop any venue image. Gemini Vision does the rest." },
              { step: "02", title: "Review AI analysis", desc: "Zones, capacities, accessibility scores, and layout recommendations." },
              { step: "03", title: "Monitor live", desc: "Real-time density heatmaps and autonomous AI safety alerts." },
            ].map(s => (
              <div key={s.step} className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center">
                  <span className="text-sm font-black text-blue-400">{s.step}</span>
                </div>
                <h3 className="font-bold text-[#e8e8f0]">{s.title}</h3>
                <p className="text-sm text-[#7070a0] max-w-[220px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════ CTA */}
      <section className="relative py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden glow-border">
            <div className="relative bg-bg-surface border border-border-strong p-12 text-center rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/8 via-transparent to-violet-600/8" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-bold text-[#7070a0]">
                  <Shield className="w-3 h-3 text-blue-400" />
                  Free to use · No credit card needed
                </div>
                <h2 className="text-[clamp(28px,5vw,52px)] font-black tracking-tight gradient-text-white mb-4 leading-tight">
                  Ready to protect<br />your event?
                </h2>
                <p className="text-[#7070a0] text-lg mb-8 max-w-md mx-auto">Start by analyzing your venue floor plan with Gemini Vision.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/analyzer" className="btn-primary py-3.5 px-8 text-[15px] group">
                    <span className="relative z-10 flex items-center gap-2">
                      Analyze Floor Plan
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                  <Link href="/attendee" className="btn-secondary py-3.5 px-8 text-[15px]">
                    View Live Map
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.04] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-sm text-[#7070a0]">CrowdSense</span>
          </div>
          <p className="text-sm text-[#404060]">© 2024 CrowdSense. Built for safe events, at scale.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Docs"].map(i => (
              <a key={i} href="#" className="text-sm text-[#404060] hover:text-[#7070a0] transition-colors font-medium">{i}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
