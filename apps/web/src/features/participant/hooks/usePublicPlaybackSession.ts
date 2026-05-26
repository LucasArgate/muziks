"use client";

import type { PublicPlaybackSession } from "@muziks/types";
import { useCallback, useEffect, useState } from "react";

import { subscribePlaybackSessionSnapshots } from "@/src/lib/realtime/playback-session-channel";

export type UsePublicPlaybackSessionOptions = {
  slug: string;
  playerId: string | null;
  transport?: "poll" | "realtime";
  pollMs?: number;
};

function logPlaybackSessionDebug(
  hypothesisId: string,
  message: string,
  data: Record<string, unknown>,
) {
  // #region agent log
  fetch("http://127.0.0.1:7578/ingest/e8024fdc-5651-46a5-b9c2-1e51cc3e18ef", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "cc732b",
    },
    body: JSON.stringify({
      sessionId: "cc732b",
      runId: "initial",
      hypothesisId,
      location:
        "apps/web/src/features/participant/hooks/usePublicPlaybackSession.ts",
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
}

function logPlaybackSessionCurrentDebug(
  hypothesisId: string,
  message: string,
  data: Record<string, unknown>,
) {
  // #region agent log
  fetch("http://127.0.0.1:7578/ingest/e8024fdc-5651-46a5-b9c2-1e51cc3e18ef", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "f48c1c",
    },
    body: JSON.stringify({
      sessionId: "f48c1c",
      runId: "initial",
      hypothesisId,
      location:
        "apps/web/src/features/participant/hooks/usePublicPlaybackSession.ts",
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
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
      const response = await fetch(`/api/players/${slug}/playback`);
      const body = (await response.json()) as {
        session?: PublicPlaybackSession | null;
      };
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
          logPlaybackSessionDebug("H2", "public GET session response", {
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
  }, [slug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setRealtimeFailed(false);
  }, [playerId, transport]);

  useEffect(() => {
    const shouldPoll =
      transport === "poll" || !playerId || realtimeFailed;
    // #region agent log
    fetch("http://127.0.0.1:7578/ingest/e8024fdc-5651-46a5-b9c2-1e51cc3e18ef", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "867515" }, body: JSON.stringify({ sessionId: "867515", runId: "initial", hypothesisId: "H1", location: "apps/web/src/features/participant/hooks/usePublicPlaybackSession.ts:51", message: "public playback transport decision", data: { slug, playerId, transport, realtimeFailed, shouldPoll, pollMs }, timestamp: Date.now() }) }).catch(() => {});
    fetch("/api/debug/realtime", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ runId: "same-origin", hypothesisId: "H1", location: "apps/web/src/features/participant/hooks/usePublicPlaybackSession.ts:51", message: "public playback transport decision", data: { slug, playerId, transport, realtimeFailed, shouldPoll, pollMs }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
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
        // #region agent log
        fetch("http://127.0.0.1:7578/ingest/e8024fdc-5651-46a5-b9c2-1e51cc3e18ef", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "867515" }, body: JSON.stringify({ sessionId: "867515", runId: "initial", hypothesisId: "H4", location: "apps/web/src/features/participant/hooks/usePublicPlaybackSession.ts:71", message: "public playback realtime snapshot accepted", data: { slug, playerId, stateVersion: next.stateVersion, status: next.status, paused: next.paused }, timestamp: Date.now() }) }).catch(() => {});
        fetch("/api/debug/realtime", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ runId: "same-origin", hypothesisId: "H4", location: "apps/web/src/features/participant/hooks/usePublicPlaybackSession.ts:71", message: "public playback realtime snapshot accepted", data: { slug, playerId, stateVersion: next.stateVersion, status: next.status, paused: next.paused }, timestamp: Date.now() }) }).catch(() => {});
        // #endregion
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
          logPlaybackSessionDebug("H3", "public realtime session snapshot", {
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
        // #region agent log
        fetch("http://127.0.0.1:7578/ingest/e8024fdc-5651-46a5-b9c2-1e51cc3e18ef", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "867515" }, body: JSON.stringify({ sessionId: "867515", runId: "initial", hypothesisId: "H2", location: "apps/web/src/features/participant/hooks/usePublicPlaybackSession.ts:83", message: "public playback realtime error callback", data: { slug, playerId, error: error instanceof Error ? { name: error.name, message: error.message } : { value: String(error) } }, timestamp: Date.now() }) }).catch(() => {});
        fetch("/api/debug/realtime", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ runId: "same-origin", hypothesisId: "H2", location: "apps/web/src/features/participant/hooks/usePublicPlaybackSession.ts:83", message: "public playback realtime error callback", data: { slug, playerId, error: error instanceof Error ? { name: error.name, message: error.message } : { value: String(error) } }, timestamp: Date.now() }) }).catch(() => {});
        // #endregion
        setRealtimeFailed(true);
      },
    );
  }, [playerId, realtimeFailed, transport]);

  return { session, loading };
}
