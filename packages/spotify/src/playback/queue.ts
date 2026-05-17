import type { NormalizedSpotifyPlaybackQueue } from "@muziks/types";

import { spotifyFetch, type SpotifyFetchOptions } from "../api";
import type { SpotifyApiTrack } from "./types";

export type GetPlaybackQueueParams = Pick<SpotifyFetchOptions, "accessToken">;

export type SpotifyApiPlaybackQueueResponse = {
  currently_playing: SpotifyApiTrack | null;
  queue: SpotifyApiTrack[];
};

export async function getPlaybackQueue(
  params: GetPlaybackQueueParams,
): Promise<SpotifyApiPlaybackQueueResponse> {
  return spotifyFetch<SpotifyApiPlaybackQueueResponse>("/me/player/queue", {
    accessToken: params.accessToken,
  });
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
  return {
    currentlyPlaying: normalizeTrack(raw.currently_playing),
    upcoming: raw.queue.map((track) => normalizeTrack(track)!),
  };
}
