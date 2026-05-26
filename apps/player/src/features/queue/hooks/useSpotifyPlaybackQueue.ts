"use client";

import type { NormalizedSpotifyPlaybackQueue } from "@muziks/types";
import { sendAgentDebugLog } from "@muziks/utils";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const requestSeqRef = useRef(0);
  const previousTrackUriRef = useRef<string | null | undefined>(trackUri);

  const logQueueDebug = useCallback(
    (message: string, data: Record<string, unknown>) => {
      sendAgentDebugLog({
        hypothesisId: "H8",
        location: "apps/player/src/features/queue/hooks/useSpotifyPlaybackQueue.ts",
        message,
        data: { enabled, pollEnabled, trackUri: trackUri ?? null, ...data },
      });
    },
    [enabled, pollEnabled, trackUri],
  );

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    const requestSeq = ++requestSeqRef.current;
    setLoading(true);
    logQueueDebug("spotify queue refresh requested", { requestSeq });
    try {
      const response = await fetch("/api/spotify/playback/queue", {
        cache: "no-store",
      });
      const body = (await response.json()) as {
        queue?: NormalizedSpotifyPlaybackQueue;
        error?: string;
      };

      if (requestSeq !== requestSeqRef.current) {
        logQueueDebug("spotify queue refresh ignored as stale", {
          requestSeq,
          currentRequestSeq: requestSeqRef.current,
          responseStatus: response.status,
        });
        return;
      }

      if (!response.ok) {
        setError(body.error ?? "spotify_queue_fetch_failed");
        logQueueDebug("spotify queue refresh failed", {
          requestSeq,
          responseStatus: response.status,
          error: body.error ?? null,
        });
        return;
      }

      setQueue(body.queue ?? null);
      setError(null);
      sendAgentDebugLog({
        sessionId: "78c1c7",
        runId: "initial-map",
        hypothesisId: "H2",
        location: "apps/player/src/features/queue/hooks/useSpotifyPlaybackQueue.ts",
        message: "spotify queue GET accepted",
        data: {
          requestSeq,
          enabled,
          pollEnabled,
          trackUri: trackUri ?? null,
          responseStatus: response.status,
          queueCurrentUri: body.queue?.currentlyPlaying?.uri ?? null,
          upcomingCount: body.queue?.upcoming.length ?? 0,
          hasQueue: Boolean(body.queue),
        },
      });
      logQueueDebug("spotify queue refresh accepted", {
        requestSeq,
        responseStatus: response.status,
        currentUri: body.queue?.currentlyPlaying?.uri ?? null,
        upcomingCount: body.queue?.upcoming.length ?? 0,
      });
    } catch {
      if (requestSeq === requestSeqRef.current) {
        setError("spotify_queue_fetch_failed");
        logQueueDebug("spotify queue refresh threw", { requestSeq });
      }
    } finally {
      if (requestSeq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  }, [enabled, logQueueDebug, pollEnabled, trackUri]);

  useEffect(() => {
    if (previousTrackUriRef.current === trackUri) {
      return;
    }

    const previousTrackUri = previousTrackUriRef.current;
    previousTrackUriRef.current = trackUri;
    requestSeqRef.current += 1;
    sendAgentDebugLog({
      sessionId: "78c1c7",
      runId: "initial-map",
      hypothesisId: "H2",
      location: "apps/player/src/features/queue/hooks/useSpotifyPlaybackQueue.ts",
      message: "spotify queue local state reset after trackUri change",
      data: {
        enabled,
        pollEnabled,
        previousTrackUri: previousTrackUri ?? null,
        nextTrackUri: trackUri ?? null,
        requestSeq: requestSeqRef.current,
      },
    });
    setQueue(null);
    setError(null);
    setLoading(false);
    logQueueDebug("spotify queue reset after track change", {
      requestSeq: requestSeqRef.current,
    });
  }, [enabled, logQueueDebug, pollEnabled, trackUri]);

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
