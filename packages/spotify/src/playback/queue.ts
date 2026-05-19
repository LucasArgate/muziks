import type { NormalizedSpotifyPlaybackQueue } from "@muziks/types";

import { sdkForAccessToken } from "../client";
import type { SpotifyApiPlaybackQueueResponse, SpotifyApiTrack } from "./types";
import { isSpotifyApiTrack } from "./types";

export type GetPlaybackQueueParams = {
  accessToken: string;
};

export type { SpotifyApiPlaybackQueueResponse };

export async function getPlaybackQueue(
  params: GetPlaybackQueueParams,
): Promise<SpotifyApiPlaybackQueueResponse> {
  const sdk = sdkForAccessToken(params.accessToken);
  const queue = await sdk.player.getUsersQueue();
  return queue ?? { currently_playing: null, queue: [] };
}

function pickAlbumImageUrl(track: SpotifyApiTrack | null): string | null {
  const images = track?.album.images;
  if (!images?.length) return null;
  return images[0]?.url ?? null;
}

function normalizeTrack(
  track: SpotifyApiTrack | null,
): NormalizedSpotifyPlaybackQueue["currentlyPlaying"] {
  if (!track) {
    return null;
  }

  return {
    uri: track.uri,
    name: track.name,
    artistName: track.artists.map((artist) => artist.name).join(", "),
    albumImageUrl: pickAlbumImageUrl(track),
    durationMs: track.duration_ms,
  };
}

export function normalizeSpotifyPlaybackQueue(
  raw: SpotifyApiPlaybackQueueResponse,
): NormalizedSpotifyPlaybackQueue {
  const current = isSpotifyApiTrack(raw.currently_playing)
    ? raw.currently_playing
    : null;

  return {
    currentlyPlaying: normalizeTrack(current),
    upcoming: raw.queue
      .filter(isSpotifyApiTrack)
      .map((track) => normalizeTrack(track)!),
  };
}
