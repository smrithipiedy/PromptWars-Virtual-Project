"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Map, LayoutDashboard, ScanLine, Home } from "lucide-react";

const NAV_LINKS = [
  { href: "/",          label: "Home",     icon: Home },
  { href: "/dashboard", label: "Dashboard",icon: LayoutDashboard },
  { href: "/analyzer",  label: "Analyzer", icon: ScanLine },
  { href: "/attendee",  label: "Live Map", icon: Map },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="nav-blur fixed top-0 left-0 right-0 z-50 h-16" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="CrowdSense home">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <Shield className="w-4 h-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-black text-base tracking-tight text-white">CrowdSense</span>
        </Link>

        {/* Nav Links — desktop */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-[#7070a0] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Live</span>
          </div>
          {pathname !== "/attendee" && (
            <Link href="/attendee" className="btn-primary !py-2 !px-4 text-xs">
              <span className="relative z-10">Open Live Map</span>
            </Link>
          )}
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-1">
          {NAV_LINKS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`p-2 rounded-xl transition-all ${
                  active ? "bg-white/[0.08] text-white" : "text-[#404060] hover:text-white"
                }`}
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
