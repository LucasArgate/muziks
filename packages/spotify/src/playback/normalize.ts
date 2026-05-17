import type {
  NormalizedSpotifyPlayerState,
  PlaybackSessionStatus,
} from "@muziks/types";

import type { SpotifyApiPlaybackState, SpotifyApiTrack } from "./types";

function pickAlbumImageUrl(track: SpotifyApiTrack | null): string | null {
  const images = track?.album.images;
  if (!images?.length) return null;
  return images[0]?.url ?? null;
}

function deriveStatus(
  state: SpotifyApiPlaybackState | null,
): PlaybackSessionStatus {
  if (!state) return "idle";
  if (!state.item) return "ready";
  if (!state.is_playing) return "paused";
  return "playing";
}

export function normalizeApiPlaybackState(
  state: SpotifyApiPlaybackState | null,
): NormalizedSpotifyPlayerState {
  if (!state) {
    return {
      trackUri: null,
      trackName: null,
      artistName: null,
      albumImageUrl: null,
      positionMs: 0,
      durationMs: 0,
      paused: true,
      deviceId: null,
      status: "idle",
    };
  }

  const track = state.item;
  const deviceId = state.device?.id ?? null;

  return {
    trackUri: track?.uri ?? null,
    trackName: track?.name ?? null,
    artistName: track
      ? track.artists.map((artist) => artist.name).join(", ")
      : null,
    albumImageUrl: pickAlbumImageUrl(track),
    positionMs: state.progress_ms ?? 0,
    positionUpdatedAt: state.timestamp,
    durationMs: track?.duration_ms ?? 0,
    paused: !state.is_playing,
    deviceId,
    status: deriveStatus(state),
  };
}
