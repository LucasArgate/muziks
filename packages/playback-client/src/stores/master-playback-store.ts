import type {
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
} from "@muziks/types";
import { create } from "zustand";

export type MasterPlaybackState = {
  playback: NormalizedSpotifyPlayerState | null;
  syncMode: PlaybackSyncMode;
  preferredDeviceId: string | null;
  activeDeviceName: string | null;
  stateVersion: number;
  playPauseLoading: boolean;
  skipLoading: boolean;
  setPlayback: (state: NormalizedSpotifyPlayerState) => void;
  applyMasterPlayback: (state: NormalizedSpotifyPlayerState) => void;
  setSyncMode: (mode: PlaybackSyncMode) => void;
  setPreferredDevice: (deviceId: string | null, deviceName: string | null) => void;
  setStateVersion: (version: number) => void;
  setPlayPauseLoading: (loading: boolean) => void;
  setSkipLoading: (loading: boolean) => void;
  resetMasterPlayback: (
    initial?: Partial<
      Pick<
        MasterPlaybackState,
        | "playback"
        | "syncMode"
        | "preferredDeviceId"
        | "activeDeviceName"
        | "stateVersion"
      >
    >,
  ) => void;
};

export const useMasterPlaybackStore = create<MasterPlaybackState>((set) => ({
  playback: null,
  syncMode: "hybrid",
  preferredDeviceId: null,
  activeDeviceName: null,
  stateVersion: 0,
  playPauseLoading: false,
  skipLoading: false,
  setPlayback: (state) => set({ playback: state }),
  applyMasterPlayback: (state) => set({ playback: state }),
  setSyncMode: (syncMode) => set({ syncMode }),
  setPreferredDevice: (preferredDeviceId, activeDeviceName) =>
    set({ preferredDeviceId, activeDeviceName }),
  setStateVersion: (stateVersion) => set({ stateVersion }),
  setPlayPauseLoading: (playPauseLoading) => set({ playPauseLoading }),
  setSkipLoading: (skipLoading) => set({ skipLoading }),
  resetMasterPlayback: (initial) =>
    set({
      playback: initial?.playback ?? null,
      syncMode: initial?.syncMode ?? "hybrid",
      preferredDeviceId: initial?.preferredDeviceId ?? null,
      activeDeviceName: initial?.activeDeviceName ?? null,
      stateVersion: initial?.stateVersion ?? 0,
      playPauseLoading: false,
      skipLoading: false,
    }),
}));

/** Imperative writer used by PlaybackStatePublisher / coordinator callbacks. */
export function applyMasterPlayback(state: NormalizedSpotifyPlayerState): void {
  useMasterPlaybackStore.getState().applyMasterPlayback(state);
}
