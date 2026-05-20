"use client";

import type { NormalizedSpotifyPlaybackQueue } from "@muziks/types";
import { useCallback, useEffect, useState } from "react";

export type UseSpotifyPlaybackQueueOptions = {
  enabled: boolean;
  /** When false, skips periodic GET /api/spotify/playback/queue (SDK supplies queue). */
  pollEnabled?: boolean;
  trackUri: string | null | undefined;
  pollPlayingMs?: number;
  pollPausedMs?: number;
};

export function useSpotifyPlaybackQueue({
  enabled,
  pollEnabled = true,
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
    if (!enabled || !pollEnabled) {
      return;
    }

    void refresh();
  }, [enabled, pollEnabled, refresh, trackUri]);

  useEffect(() => {
    if (!enabled || !pollEnabled) {
      return;
    }

    const intervalMs = trackUri ? pollPlayingMs : pollPausedMs;
    const timer = window.setInterval(() => {
      void refresh();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [enabled, pollEnabled, pollPausedMs, pollPlayingMs, refresh, trackUri]);

  return { queue, loading, error, refresh };
}
