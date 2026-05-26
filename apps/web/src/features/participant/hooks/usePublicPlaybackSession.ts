"use client";

import type { PublicPlaybackSession } from "@muziks/types";
import { sendAgentDebugLog } from "@muziks/utils";
import { useCallback, useEffect, useState } from "react";

import { subscribePlaybackSessionSnapshots } from "@/src/lib/realtime/playback-session-channel";

export type UsePublicPlaybackSessionOptions = {
  slug: string;
  playerId: string | null;
  transport?: "poll" | "realtime";
  pollMs?: number;
};

function logPlaybackSessionCurrentDebug(
  hypothesisId: string,
  message: string,
  data: Record<string, unknown>,
) {
  sendAgentDebugLog({
    sameOriginPath: "/api/debug/realtime",
    runId: "post-fix-web",
    hypothesisId,
    location:
      "apps/web/src/features/participant/hooks/usePublicPlaybackSession.ts",
    message,
    data,
  });
}

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
      logPlaybackSessionCurrentDebug("H6", "public playback refresh requested", {
        slug,
        playerId,
        transport,
      });
      const response = await fetch(`/api/players/${slug}/playback`);
      const body = (await response.json()) as {
        session?: PublicPlaybackSession | null;
        error?: string;
      };
      logPlaybackSessionCurrentDebug("H6", "public playback refresh completed", {
        slug,
        playerId,
        responseStatus: response.status,
        hasSession: Boolean(body.session),
        stateVersion: body.session?.stateVersion ?? null,
        status: body.session?.status ?? null,
        error: body.error ?? null,
      });
      if (response.ok) {
        const next = body.session ?? null;
        setSession((current) => {
          logPlaybackSessionCurrentDebug("H5", "public GET session response", {
            slug,
            currentVersion: current?.stateVersion ?? null,
            nextVersion: next?.stateVersion ?? null,
            currentStatus: current?.status ?? null,
            nextStatus: next?.status ?? null,
            accepted:
              !current ||
              !next ||
              next.stateVersion >= current.stateVersion,
          });
          if (current && next && next.stateVersion < current.stateVersion) {
            return current;
          }
          return next;
        });
      }
    } finally {
      setLoading(false);
    }
  }, [playerId, slug, transport]);

  useEffect(() => {
    logPlaybackSessionCurrentDebug("H6", "public playback hook configured", {
      slug,
      playerId,
      transport,
      pollMs,
    });
    void refresh();
  }, [playerId, pollMs, refresh, slug, transport]);

  useEffect(() => {
    setRealtimeFailed(false);
  }, [playerId, transport]);

  useEffect(() => {
    const shouldPoll =
      transport === "poll" || !playerId || realtimeFailed;
    logPlaybackSessionCurrentDebug("H6", "public playback transport decision", {
      slug,
      playerId,
      transport,
      realtimeFailed,
      shouldPoll,
      pollMs,
    });
    if (!shouldPoll) {
      return;
    }

    const timer = window.setInterval(() => {
      void refresh();
    }, pollMs);
    return () => window.clearInterval(timer);
  }, [playerId, pollMs, realtimeFailed, refresh, slug, transport]);

  useEffect(() => {
    if (transport !== "realtime" || !playerId || realtimeFailed) {
      return;
    }

    return subscribePlaybackSessionSnapshots(
      playerId,
      (next) => {
        setSession((current) => {
          logPlaybackSessionCurrentDebug("H5", "public realtime session snapshot", {
            slug,
            playerId,
            currentVersion: current?.stateVersion ?? null,
            nextVersion: next.stateVersion,
            currentStatus: current?.status ?? null,
            nextStatus: next.status,
            accepted: !current || next.stateVersion >= current.stateVersion,
          });
          if (current && next.stateVersion < current.stateVersion) {
            return current;
          }
          return next;
        });
        setLoading(false);
      },
      (error) => {
        logPlaybackSessionCurrentDebug("H7", "public playback realtime error", {
          slug,
          playerId,
          error: error instanceof Error
            ? { name: error.name, message: error.message }
            : { value: String(error) },
        });
        setRealtimeFailed(true);
      },
    );
  }, [playerId, realtimeFailed, slug, transport]);

  return { session, loading };
}
