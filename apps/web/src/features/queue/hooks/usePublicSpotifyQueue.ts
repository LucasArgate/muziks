"use client";

import type { NormalizedSpotifyPlaybackQueue } from "@muziks/types";
import { useCallback, useEffect, useRef, useState } from "react";

export type UsePublicSpotifyQueueOptions = {
  slug: string;
  enabled?: boolean;
  pollMs?: number;
};

export function usePublicSpotifyQueue({
  slug,
  enabled = true,
  pollMs = 20000,
}: UsePublicSpotifyQueueOptions) {
  const [queue, setQueue] = useState<NormalizedSpotifyPlaybackQueue | null>(
    null,
  );
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const requestSeqRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    const requestSeq = ++requestSeqRef.current;
    setLoading(true);

    try {
      const response = await fetch(
        `/api/players/${encodeURIComponent(slug)}/playback/spotify-queue`,
        { cache: "no-store" },
      );
      const body = (await response.json()) as {
        queue?: NormalizedSpotifyPlaybackQueue;
        error?: string;
        message?: string;
      };

      if (requestSeq !== requestSeqRef.current) {
        return;
      }

      if (!response.ok) {
        setQueue(null);
        setError(body.message ?? body.error ?? "spotify_queue_fetch_failed");
        return;
      }

      setQueue(body.queue ?? null);
      setError(null);
    } catch {
      if (requestSeq === requestSeqRef.current) {
        setQueue(null);
        setError("spotify_queue_fetch_failed");
      }
    } finally {
      if (requestSeq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, slug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const timer = window.setInterval(() => {
      void refresh();
    }, pollMs);

    return () => window.clearInterval(timer);
  }, [enabled, pollMs, refresh]);

  return { queue, loading, error, refresh };
}
