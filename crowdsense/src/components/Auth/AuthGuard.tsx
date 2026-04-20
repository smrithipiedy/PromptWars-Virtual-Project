"use client";

import React, { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  requireOrganizer?: boolean;
}

export function AuthGuard({ children, requireOrganizer = false }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
    if (!loading && user && requireOrganizer && !user.isOrganizer) {
      router.push("/");
    }
  }, [user, loading, router, requireOrganizer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#04040a]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-[#7070a0] text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (requireOrganizer && !user.isOrganizer) return null;

  return <>{children}</>;
}
