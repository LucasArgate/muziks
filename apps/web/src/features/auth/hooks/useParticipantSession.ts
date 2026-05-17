"use client";

import { useCallback, useEffect, useState } from "react";

export type ParticipantSessionView =
  | { status: "anonymous" }
  | {
      status: "authenticated";
      userId: string;
      displayName: string | null;
      avatarUrl: string | null;
    };

export function useParticipantSession() {
  const [session, setSession] = useState<ParticipantSessionView>({
    status: "anonymous",
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session");
      const body = (await response.json()) as ParticipantSessionView;
      setSession(body);
    } catch {
      setSession({ status: "anonymous" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { session, loading, refresh, isAuthenticated: session.status === "authenticated" };
}
