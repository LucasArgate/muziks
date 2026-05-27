"use client";

import type { NormalizedSpotifyPlaybackQueue } from "@muziks/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { create } from "zustand";

export type UseSpotifyPlaybackQueueOptions = {
  enabled: boolean;
  /** When false, skips periodic GET /api/spotify/playback/queue (SDK supplies queue). */
  pollEnabled?: boolean;
  trackUri: string | null | undefined;
  pollPlayingMs?: number;
  pollPausedMs?: number;
};

type SpotifyPlaybackQueueStore = {
  queue: NormalizedSpotifyPlaybackQueue | null;
  setQueue: (queue: NormalizedSpotifyPlaybackQueue | null) => void;
};

export const useSpotifyPlaybackQueueStore = create<SpotifyPlaybackQueueStore>(
  (set) => ({
    queue: null,
    setQueue: (queue) => set({ queue }),
  }),
);

export function useSpotifyPlaybackQueue({
  enabled,
  pollEnabled = true,
  trackUri,
  pollPlayingMs = 8000,
  pollPausedMs = 20000,
}: UseSpotifyPlaybackQueueOptions) {
  const queue = useSpotifyPlaybackQueueStore((state) => state.queue);
  const setQueue = useSpotifyPlaybackQueueStore(
    (state) => state.setQueue,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSeqRef = useRef(0);
  const previousTrackUriRef = useRef<string | null | undefined>(trackUri);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    const requestSeq = ++requestSeqRef.current;
    setLoading(true);
    try {
      const response = await fetch("/api/spotify/playback/queue", {
        cache: "no-store",
      });
      const body = (await response.json()) as {
        queue?: NormalizedSpotifyPlaybackQueue;
        error?: string;
      };

      if (requestSeq !== requestSeqRef.current) {
        return;
      }

      if (!response.ok) {
        setError(body.error ?? "spotify_queue_fetch_failed");
        return;
      }

      setQueue(body.queue ?? null);
      setError(null);
    } catch {
      if (requestSeq === requestSeqRef.current) {
        setError("spotify_queue_fetch_failed");
      }
    } finally {
      if (requestSeq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, setQueue]);

  useEffect(() => {
    if (previousTrackUriRef.current === trackUri) {
      return;
    }

    previousTrackUriRef.current = trackUri;
    requestSeqRef.current += 1;
    setError(null);
    if (enabled && pollEnabled) {
      void refresh();
    }
  }, [enabled, pollEnabled, refresh, trackUri]);

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
