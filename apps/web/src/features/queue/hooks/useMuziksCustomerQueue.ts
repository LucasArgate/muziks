"use client";

import type { MuziksQueueSnapshot } from "@muziks/types";
import { useCallback, useEffect, useState } from "react";

export function useMuziksCustomerQueue(slug: string, pollMs = 4000) {
  const [snapshot, setSnapshot] = useState<MuziksQueueSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const timer = window.setInterval(() => {
      void refresh();
    }, pollMs);
    return () => window.clearInterval(timer);
  }, [pollMs, refresh]);

  return {
    snapshot,
    items: snapshot?.items ?? [],
    loading,
    error,
    refresh,
  };
}
