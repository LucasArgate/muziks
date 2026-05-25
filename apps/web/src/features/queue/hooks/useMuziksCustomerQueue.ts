"use client";

import type { MuziksQueueSnapshot } from "@muziks/types";
import { useCallback, useEffect, useState } from "react";

import { subscribeQueueSnapshots } from "@/src/lib/realtime/muziks-queue-channel";

export type UseMuziksCustomerQueueOptions = {
  slug: string;
  playerId: string | null;
  transport?: "poll" | "realtime";
  pollMs?: number;
};

export function useMuziksCustomerQueue({
  slug,
  playerId,
  transport = "realtime",
  pollMs = 10000,
}: UseMuziksCustomerQueueOptions) {
  const [snapshot, setSnapshot] = useState<MuziksQueueSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeFailed, setRealtimeFailed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/players/${slug}/queue`);
      const body = (await response.json()) as {
        snapshot?: MuziksQueueSnapshot;
        error?: string;
      };

      if (!response.ok) {
        setError(body.error ?? "muziks_queue_fetch_failed");
        return;
      }

      if (body.snapshot) {
        setSnapshot(body.snapshot);
      }
      setError(null);
    } catch {
      setError("muziks_queue_fetch_failed");
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

    return subscribeQueueSnapshots(
      playerId,
      (next) => {
        setSnapshot(next);
        setError(null);
      },
      () => {
        setRealtimeFailed(true);
        setError("muziks_queue_realtime_failed");
      },
    );
  }, [playerId, realtimeFailed, transport]);

  return {
    snapshot,
    items: snapshot?.items ?? [],
    loading,
    error,
    refresh,
  };
}
