import type { PublicPlaybackSession } from "@muziks/types";
import { create } from "zustand";

export type PublicPlaybackSource = "http" | "realtime";

export type PublicPlaybackStoreState = {
  session: PublicPlaybackSession | null;
  loading: boolean;
  source: PublicPlaybackSource | null;
  setLoading: (loading: boolean) => void;
  applyPublicSession: (
    session: PublicPlaybackSession,
    source: PublicPlaybackSource,
  ) => void;
  resetPublicPlayback: (session?: PublicPlaybackSession | null) => void;
};

function shouldAcceptSession(
  current: PublicPlaybackSession | null,
  next: PublicPlaybackSession,
): boolean {
  if (!current) {
    return true;
  }
  return next.stateVersion >= current.stateVersion;
}

export const usePublicPlaybackStore = create<PublicPlaybackStoreState>(
  (set, get) => ({
    session: null,
    loading: true,
    source: null,
    setLoading: (loading) => set({ loading }),
    applyPublicSession: (session, source) => {
      const current = get().session;
      if (!shouldAcceptSession(current, session)) {
        return;
      }
      set({ session, source, loading: false });
    },
    resetPublicPlayback: (session = null) =>
      set({ session, loading: false, source: null }),
  }),
);
