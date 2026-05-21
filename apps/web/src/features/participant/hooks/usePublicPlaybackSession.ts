"use client";

import {
  mapBroadcastToPublic,
  usePublicPlaybackStore,
} from "@muziks/playback-client";
import type { PublicPlaybackSession } from "@muziks/types";
import { useCallback, useEffect } from "react";

import { subscribeSessionSnapshots } from "@/src/lib/realtime/player-session-channel";

const FALLBACK_POLL_MS = 30_000;

export type UsePublicPlaybackSessionOptions = {
  slug: string;
  playerId: string | null;
};

export function usePublicPlaybackSession({
  slug,
  playerId,
}: UsePublicPlaybackSessionOptions) {
  const session = usePublicPlaybackStore((s) => s.session);
  const loading = usePublicPlaybackStore((s) => s.loading);
  const applyPublicSession = usePublicPlaybackStore((s) => s.applyPublicSession);
  const setLoading = usePublicPlaybackStore((s) => s.setLoading);
  const resetPublicPlayback = usePublicPlaybackStore((s) => s.resetPublicPlayback);

  const refreshHttp = useCallback(async () => {
    try {
      const response = await fetch(`/api/players/${slug}/playback`);
      const body = (await response.json()) as {
        session?: PublicPlaybackSession | null;
      };
      if (response.ok && body.session) {
        applyPublicSession(body.session, "http");
      } else if (response.ok && !body.session) {
        resetPublicPlayback(null);
      }
    } finally {
      setLoading(false);
    }
  }, [applyPublicSession, resetPublicPlayback, setLoading, slug]);

  useEffect(() => {
    setLoading(true);
    void refreshHttp();
  }, [refreshHttp, setLoading]);

  useEffect(() => {
    if (!playerId) {
      return;
    }

    const unsubscribe = subscribeSessionSnapshots(playerId, (payload) => {
      applyPublicSession(mapBroadcastToPublic(payload), "realtime");
    });

    return unsubscribe;
  }, [applyPublicSession, playerId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refreshHttp();
    }, FALLBACK_POLL_MS);

    return () => window.clearInterval(timer);
  }, [refreshHttp]);

  return { session, loading };
}
