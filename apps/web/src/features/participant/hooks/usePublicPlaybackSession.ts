"use client";

import type { PublicPlaybackSession } from "@muziks/types";
import { useCallback, useEffect, useState } from "react";

import { subscribePlaybackSessionSnapshots } from "@/src/lib/realtime/playback-session-channel";

export type UsePublicPlaybackSessionOptions = {
  slug: string;
  playerId: string | null;
  transport?: "poll" | "realtime";
  pollMs?: number;
};

export function usePublicPlaybackSession({
  slug,
  playerId,
  transport = "realtime",
  pollMs = 30000,
}: UsePublicPlaybackSessionOptions) {
  const [session, setSession] = useState<PublicPlaybackSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [realtimeFailed, setRealtimeFailed] = useState(false);

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
  }, [refresh]);

  useEffect(() => {
    setRealtimeFailed(false);
  }, [playerId, transport]);

  useEffect(() => {
    const shouldPoll =
      transport === "poll" || !playerId || realtimeFailed;
    if (!shouldPoll) {
      return;
    }

    const timer = window.setInterval(() => {
      void refresh();
    }, pollMs);
    return () => window.clearInterval(timer);
  }, [playerId, pollMs, realtimeFailed, refresh, transport]);

  useEffect(() => {
    if (transport !== "realtime" || !playerId || realtimeFailed) {
      return;
    }

    return subscribePlaybackSessionSnapshots(
      playerId,
      (next) => {
        setSession((current) => {
          if (current && next.stateVersion < current.stateVersion) {
            return current;
          }
          return next;
        });
        setLoading(false);
      },
      () => {
        setRealtimeFailed(true);
      },
    );
  }, [playerId, realtimeFailed, transport]);

  return { session, loading };
}
