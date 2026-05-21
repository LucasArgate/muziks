import type { MuziksQueueSnapshot } from "@muziks/types";
import { create } from "zustand";

export type MuziksQueueStoreState = {
  snapshot: MuziksQueueSnapshot | null;
  loading: boolean;
  error: string | null;
  setSnapshot: (snapshot: MuziksQueueSnapshot) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetMuziksQueue: () => void;
};

export const useMuziksQueueStore = create<MuziksQueueStoreState>((set) => ({
  snapshot: null,
  loading: false,
  error: null,
  setSnapshot: (snapshot) => set({ snapshot, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  resetMuziksQueue: () =>
    set({ snapshot: null, loading: false, error: null }),
}));
