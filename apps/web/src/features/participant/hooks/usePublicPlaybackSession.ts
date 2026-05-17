"use client";

import type { PublicPlaybackSession } from "@muziks/types";
import { useCallback, useEffect, useState } from "react";

export function usePublicPlaybackSession(slug: string, pollMs = 4000) {
  const [session, setSession] = useState<PublicPlaybackSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/players/${slug}/playback`);
      const body = (await response.json()) as {
        session?: PublicPlaybackSession | null;
      };
      if (response.ok) {
        setSession(body.session ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, pollMs);
    return () => window.clearInterval(timer);
  }, [pollMs, refresh]);

  return { session, loading };
}
