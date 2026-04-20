"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#04040a] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500/20 blur-[60px] animate-pulse" />
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin relative z-10" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Initializing Experience</h2>
      <p className="text-[#7070a0] text-sm max-w-xs">
        Preparing your spatial intelligence dashboard and loading real-time data.
      </p>
    </div>
  );
}
