"use client";

import { useMuziksQueueStore } from "@muziks/playback-client";
import type { MuziksQueueSnapshot } from "@muziks/types";
import { useCallback, useEffect } from "react";

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
  transport = "poll",
  pollMs = 4000,
}: UseMuziksCustomerQueueOptions) {
  const snapshot = useMuziksQueueStore((s) => s.snapshot);
  const loading = useMuziksQueueStore((s) => s.loading);
  const error = useMuziksQueueStore((s) => s.error);
  const setSnapshot = useMuziksQueueStore((s) => s.setSnapshot);
  const setLoading = useMuziksQueueStore((s) => s.setLoading);
  const setError = useMuziksQueueStore((s) => s.setError);

  const refresh = useCallback(async () => {
    setLoading(true);
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
  }, [setError, setLoading, setSnapshot, slug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (transport !== "poll") {
      return;
    }

    const timer = window.setInterval(() => {
      void refresh();
    }, pollMs);

    return () => window.clearInterval(timer);
  }, [pollMs, refresh, transport]);

  useEffect(() => {
    if (transport !== "realtime" || !playerId) {
      return;
    }

    return subscribeQueueSnapshots(playerId, (next) => {
      setSnapshot(next);
    });
  }, [playerId, setSnapshot, transport]);

  const applySnapshot = useCallback(
    (next: MuziksQueueSnapshot) => {
      setSnapshot(next);
    },
    [setSnapshot],
  );

  return {
    snapshot,
    items: snapshot?.items ?? [],
    loading,
    error,
    refresh,
    applySnapshot,
  };
}
