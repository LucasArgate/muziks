"use client";

import { muziksSessionViewSchema, type MuziksSessionView } from "@muziks/types";
import { useCallback, useEffect, useState } from "react";

export function useMuziksSession() {
  const [session, setSession] = useState<MuziksSessionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/session");
      if (!response.ok) {
        throw new Error("Failed to load session");
      }
      const json: unknown = await response.json();
      const parsed = muziksSessionViewSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error("Invalid session payload");
      }
      setSession(parsed.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Session error");
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { session, loading, error, refresh };
}
