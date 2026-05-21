import type {
  NormalizedSpotifyPlayerState,
  PublicPlaybackSession,
} from "@muziks/types";

import type { MasterPlaybackState } from "../stores/master-playback-store";

export function selectIsPaused(
  playback: NormalizedSpotifyPlayerState | null | undefined,
): boolean {
  return playback?.paused ?? true;
}

export function selectNowPlayingLabel(
  playback: NormalizedSpotifyPlayerState | null | undefined,
): { title: string; artist: string } {
  return {
    title: playback?.trackName?.trim() || "Nada tocando",
    artist: playback?.artistName?.trim() || "",
  };
}

export function selectPublicNowPlayingLabel(
  session: PublicPlaybackSession | null | undefined,
): { title: string; artist: string } {
  return {
    title: session?.trackName?.trim() || "Nada tocando",
    artist: session?.artistName?.trim() || "",
  };
}

export function selectCanControl(
  state: MasterPlaybackState,
  sdkReady: boolean,
): boolean {
  if (!state.playback?.trackUri) {
    return false;
  }
  if (state.playPauseLoading || state.skipLoading) {
    return false;
  }
  if (state.syncMode === "api_device" && !state.preferredDeviceId) {
    return false;
  }
  if (state.syncMode === "sdk") {
    return sdkReady;
  }
  if (state.syncMode === "hybrid") {
    return sdkReady || Boolean(state.preferredDeviceId);
  }
  return Boolean(state.preferredDeviceId);
}
