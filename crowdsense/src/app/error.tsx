"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { logger } from "@/lib/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Global Application Error", { error });
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#04040a] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
        <AlertTriangle className="w-10 h-10 text-red-500" />
      </div>
      
      <h1 className="text-3xl font-black text-white mb-4">Something went wrong</h1>
      <p className="text-[#7070a0] text-base max-w-md mb-10 leading-relaxed">
        We encountered an unexpected error while processing your request. Our AI and safety systems have logged this event.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="btn-primary"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="btn-secondary"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <p className="mt-12 text-[10px] font-mono text-[#404060] uppercase tracking-widest">
        Error ID: {error.digest || "unknown_failure"}
      </p>
    </div>
  );
}
