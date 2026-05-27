"use client";

import type { PublicPlaybackSession } from "@muziks/types";
import { useCallback, useEffect, useState } from "react";

import { subscribePlaybackSessionSnapshots } from "@/src/lib/realtime/playback-session-channel";

export type UsePublicPlaybackSessionOptions = {
  slug: string;
  playerId: string | null;
  transport?: "poll" | "realtime";
  pollMs?: number;
  initialSession?: PublicPlaybackSession | null;
};

export function usePublicPlaybackSession({
  slug,
  playerId,
  transport = "realtime",
  pollMs = 30000,
  initialSession = null,
}: UsePublicPlaybackSessionOptions) {
  const [session, setSession] = useState<PublicPlaybackSession | null>(
    initialSession,
  );
  const [loading, setLoading] = useState(!initialSession);
  const [realtimeFailed, setRealtimeFailed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/players/${slug}/playback`);
      const body = (await response.json()) as {
        session?: PublicPlaybackSession | null;
        error?: string;
      };
      if (response.ok) {
        const next = body.session ?? null;
        setSession((current) => {
          if (current && next && next.stateVersion < current.stateVersion) {
            return current;
          }
          return next;
        });
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    setSession((current) => {
      if (!initialSession) {
        return current;
      }
      if (current && current.stateVersion > initialSession.stateVersion) {
        return current;
      }
      return initialSession;
    });
    if (initialSession) {
      setLoading(false);
    }
  }, [initialSession]);

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
