"use client";

import type { NormalizedSpotifyPlaybackQueue } from "@muziks/types";
import { useCallback, useEffect, useRef, useState } from "react";

import { subscribeSpotifyQueueSnapshots } from "@/src/lib/realtime/player-session-channel";

import {
  useSpotifyPlaybackQueue,
  useSpotifyPlaybackQueueStore,
  type UseSpotifyPlaybackQueueOptions,
} from "./useSpotifyPlaybackQueue";

const REALTIME_STALE_MS = 45_000;

export type UseSpotifyPlaybackQueueRealtimeOptions =
  UseSpotifyPlaybackQueueOptions & {
    playerId: string | null | undefined;
    trackUri?: string | null;
  };

export function useSpotifyPlaybackQueueRealtime({
  enabled,
  playerId,
  trackUri,
  pollEnabled = true,
  pollPlayingMs,
  pollPausedMs,
}: UseSpotifyPlaybackQueueRealtimeOptions) {
  const queue = useSpotifyPlaybackQueueStore((state) => state.queue);
  const setQueue = useSpotifyPlaybackQueueStore((state) => state.setQueue);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const lastRealtimeAtRef = useRef(0);
  const queueVersionRef = useRef(0);

  const applySnapshot = useCallback(
    (next: NormalizedSpotifyPlaybackQueue, queueVersion: number) => {
      if (queueVersion <= queueVersionRef.current) {
        return;
      }
      queueVersionRef.current = queueVersion;
      lastRealtimeAtRef.current = Date.now();
      setQueue(next);
      setRealtimeConnected(true);
    },
    [setQueue],
  );

  useEffect(() => {
    if (!enabled || !playerId) {
      return;
    }

    return subscribeSpotifyQueueSnapshots(playerId, (payload) => {
      applySnapshot(payload.queue, payload.queueVersion);
    });
  }, [applySnapshot, enabled, playerId]);

  const [pollFallbackEnabled, setPollFallbackEnabled] = useState(
    () => !playerId,
  );

  useEffect(() => {
    if (!enabled || !playerId) {
      setPollFallbackEnabled(pollEnabled);
      return;
    }

    const evaluate = () => {
      const stale =
        lastRealtimeAtRef.current === 0 ||
        Date.now() - lastRealtimeAtRef.current > REALTIME_STALE_MS;
      setPollFallbackEnabled(pollEnabled && stale);
    };

    evaluate();
    const timer = window.setInterval(evaluate, 5_000);
    return () => window.clearInterval(timer);
  }, [enabled, playerId, pollEnabled, realtimeConnected]);

  const polled = useSpotifyPlaybackQueue({
    enabled: enabled && pollFallbackEnabled,
    pollEnabled: pollFallbackEnabled,
    trackUri,
    pollPlayingMs,
    pollPausedMs,
  });

  const refresh = useCallback(async () => {
    await polled.refresh();
  }, [polled]);

  return {
    queue,
    loading: polled.loading && !queue,
    error: polled.error,
    refresh,
    realtimeConnected,
  };
}
