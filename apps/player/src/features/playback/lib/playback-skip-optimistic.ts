import type {
  NormalizedSpotifyPlaybackQueue,
  NormalizedSpotifyPlayerState,
} from "@muziks/types";

export type OptimisticSkipResult = {
  playback: NormalizedSpotifyPlayerState;
  queue: NormalizedSpotifyPlaybackQueue;
};

/** Advance UI from SDK queue lookahead before `player_state_changed` arrives. */
export function buildOptimisticSkipState(
  playback: NormalizedSpotifyPlayerState,
  queue: NormalizedSpotifyPlaybackQueue | null,
): OptimisticSkipResult | null {
  const next = queue?.upcoming?.[0];
  if (!next || !queue?.currentlyPlaying) {
    return null;
  }

  return {
    playback: {
      ...playback,
      trackUri: next.uri,
      trackName: next.name,
      artistName: next.artistName,
      albumImageUrl: next.albumImageUrl,
      positionMs: 0,
      positionUpdatedAt: Date.now(),
      durationMs: next.durationMs > 0 ? next.durationMs : playback.durationMs,
      paused: false,
      status: "playing",
      lastError: null,
    },
    queue: {
      currentlyPlaying: next,
      upcoming: queue.upcoming.slice(1),
    },
  };
}
