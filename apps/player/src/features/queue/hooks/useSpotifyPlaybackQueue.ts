"use client";

import type { NormalizedSpotifyPlaybackQueue } from "@muziks/types";
import { useCallback, useEffect, useState } from "react";

export type UseSpotifyPlaybackQueueOptions = {
  enabled: boolean;
  trackUri: string | null | undefined;
  pollPlayingMs?: number;
  pollPausedMs?: number;
};

export function useSpotifyPlaybackQueue({
  enabled,
  trackUri,
  pollPlayingMs = 8000,
  pollPausedMs = 20000,
}: UseSpotifyPlaybackQueueOptions) {
  const [queue, setQueue] = useState<NormalizedSpotifyPlaybackQueue | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/spotify/playback/queue");
      const body = (await response.json()) as {
        queue?: NormalizedSpotifyPlaybackQueue;
        error?: string;
      };

      if (!response.ok) {
        setError(body.error ?? "spotify_queue_fetch_failed");
        return;
      }

      setQueue(body.queue ?? null);
      setError(null);
    } catch {
      setError("spotify_queue_fetch_failed");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void refresh();
  }, [enabled, refresh, trackUri]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalMs = trackUri ? pollPlayingMs : pollPausedMs;
    const timer = window.setInterval(() => {
      void refresh();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [enabled, pollPausedMs, pollPlayingMs, refresh, trackUri]);

  return { queue, loading, error, refresh };
}
