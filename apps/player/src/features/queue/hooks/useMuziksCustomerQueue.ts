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
  transport = "poll",
  pollMs = 4000,
}: UseMuziksCustomerQueueOptions) {
  const [snapshot, setSnapshot] = useState<MuziksQueueSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [slug]);

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
  }, [playerId, transport]);

  const applySnapshot = useCallback((next: MuziksQueueSnapshot) => {
    setSnapshot(next);
  }, []);

  return {
    snapshot,
    items: snapshot?.items ?? [],
    loading,
    error,
    refresh,
    applySnapshot,
  };
}
