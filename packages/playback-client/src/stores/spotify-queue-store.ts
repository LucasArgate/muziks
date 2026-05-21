import type { NormalizedSpotifyPlaybackQueue } from "@muziks/types";
import { create } from "zustand";

export type SpotifyQueueStoreState = {
  queue: NormalizedSpotifyPlaybackQueue | null;
  aligned: boolean;
  loading: boolean;
  error: string | null;
  setQueue: (queue: NormalizedSpotifyPlaybackQueue | null) => void;
  setAligned: (aligned: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetSpotifyQueue: () => void;
};

export const useSpotifyQueueStore = create<SpotifyQueueStoreState>((set) => ({
  queue: null,
  aligned: false,
  loading: false,
  error: null,
  setQueue: (queue) => set({ queue }),
  setAligned: (aligned) => set({ aligned }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  resetSpotifyQueue: () =>
    set({ queue: null, aligned: false, loading: false, error: null }),
}));
