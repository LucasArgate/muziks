import {
  getCurrentPlayback,
  normalizeApiPlaybackState,
  type SpotifyApiPlaybackState,
} from "@muziks/spotify";
import type { NormalizedSpotifyPlayerState } from "@muziks/types";

export async function readNormalizedSpotifyPlaybackState(
  accessToken: string,
): Promise<NormalizedSpotifyPlayerState> {
  const raw = await getCurrentPlayback({ accessToken });
  return normalizeApiPlaybackState(raw);
}

export async function readSpotifyPlaybackSnapshot(accessToken: string): Promise<{
  raw: SpotifyApiPlaybackState | null;
  state: NormalizedSpotifyPlayerState;
  activeDeviceName: string | null;
}> {
  const raw = await getCurrentPlayback({ accessToken });
  return {
    raw: raw ?? null,
    state: normalizeApiPlaybackState(raw),
    activeDeviceName: raw?.device?.name ?? null,
  };
}
