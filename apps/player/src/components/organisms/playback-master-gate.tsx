"use client";

import type { ReactNode } from "react";

type PlaybackMasterGateProps = {
  isAuthenticated: boolean;
  children: ReactNode;
  fallback: ReactNode;
};

export function PlaybackMasterGate({
  isAuthenticated,
  children,
  fallback,
}: PlaybackMasterGateProps) {
  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
