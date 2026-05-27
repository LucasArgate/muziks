"use client";

import type { NormalizedSpotifyPlaybackQueue } from "@muziks/types";
import { useCallback, useEffect, useRef, useState } from "react";

import { subscribeSpotifyQueueSnapshots } from "@/src/lib/realtime/spotify-queue-channel";

const REALTIME_STALE_MS = 45_000;
const POLL_FALLBACK_MS = 30_000;

export type UsePublicSpotifyQueueOptions = {
  slug: string;
  playerId?: string | null;
  enabled?: boolean;
  transport?: "poll" | "realtime";
  pollMs?: number;
  trackUri?: string | null;
};

export function usePublicSpotifyQueue({
  slug,
  playerId,
  enabled = true,
  transport = "realtime",
  pollMs = POLL_FALLBACK_MS,
  trackUri,
}: UsePublicSpotifyQueueOptions) {
  const [queue, setQueue] = useState<NormalizedSpotifyPlaybackQueue | null>(
    null,
  );
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const requestSeqRef = useRef(0);
  const queueVersionRef = useRef(0);
  const lastRealtimeAtRef = useRef(0);
  const previousTrackUriRef = useRef<string | null | undefined>(trackUri);
  const [usePollFallback, setUsePollFallback] = useState(
    () => transport === "poll" || !playerId,
  );

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
    if (transport !== "realtime" || !enabled || !playerId) {
      return;
    }

    return subscribeSpotifyQueueSnapshots(playerId, (payload) => {
      if (payload.queueVersion <= queueVersionRef.current) {
        return;
      }
      queueVersionRef.current = payload.queueVersion;
      lastRealtimeAtRef.current = Date.now();
      setQueue(payload.queue);
      setError(null);
      setLoading(false);
    });
  }, [enabled, playerId, transport]);

  useEffect(() => {
    if (transport !== "realtime" || !enabled || !playerId) {
      setUsePollFallback(transport === "poll" || !playerId);
      return;
    }

    const evaluate = () => {
      const stale =
        lastRealtimeAtRef.current === 0 ||
        Date.now() - lastRealtimeAtRef.current > REALTIME_STALE_MS;
      setUsePollFallback(stale);
    };

    evaluate();
    const timer = window.setInterval(evaluate, 5_000);
    return () => window.clearInterval(timer);
  }, [enabled, playerId, transport]);

  useEffect(() => {
    if (!enabled || !usePollFallback) {
      return;
    }

    void refresh();
  }, [enabled, refresh, usePollFallback]);

  useEffect(() => {
    if (!enabled || !usePollFallback) {
      return;
    }

    const timer = window.setInterval(() => {
      void refresh();
    }, pollMs);

    return () => window.clearInterval(timer);
  }, [enabled, pollMs, refresh, usePollFallback]);

  useEffect(() => {
    if (previousTrackUriRef.current === trackUri) {
      return;
    }
    previousTrackUriRef.current = trackUri;
    if (enabled && usePollFallback) {
      void refresh();
    }
  }, [enabled, refresh, trackUri, usePollFallback]);

  return { queue, loading, error, refresh };
}
