import { spotifyFetch, type SpotifyFetchOptions } from "../api";
import type { SpotifyApiPlaybackState } from "./types";

export type GetCurrentPlaybackParams = Pick<SpotifyFetchOptions, "accessToken">;

/** Returns null when nothing is playing (HTTP 204). */
export async function getCurrentPlayback(
  params: GetCurrentPlaybackParams,
): Promise<SpotifyApiPlaybackState | null> {
  const result = await spotifyFetch<SpotifyApiPlaybackState>("/me/player", {
    accessToken: params.accessToken,
  });
  return result ?? null;
}
