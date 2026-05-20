import type { MaxInt } from "@spotify/web-api-ts-sdk";

import { sdkForAccessToken } from "./client";
import { isSpotifyApiTrack } from "./playback/types";

export type SpotifySearchTrack = {
  spotifyUri: string;
  title: string;
  artist: string;
  albumImageUrl: string | null;
};

export async function searchTracks(
  accessToken: string,
  query: string,
  limit = 12,
): Promise<SpotifySearchTrack[]> {
  const sdk = sdkForAccessToken(accessToken);
  const cappedLimit = Math.min(Math.max(1, limit), 20) as MaxInt<50>;
  const result = await sdk.search(query, ["track"], undefined, cappedLimit);

  return (result.tracks?.items ?? [])
    .filter(isSpotifyApiTrack)
    .map((item) => ({
      spotifyUri: item.uri,
      title: item.name,
      artist: item.artists?.map((a) => a.name).join(", ") ?? "Desconhecido",
      albumImageUrl: item.album?.images?.[0]?.url ?? null,
    }));
}
