import type { MaxInt } from "@spotify/web-api-ts-sdk";
import type { CatalogSearchResult } from "@muziks/types";

import { sdkForAccessToken } from "./client";
import { isSpotifyApiTrack } from "./playback/types";

export type SpotifySearchTrack = {
  spotifyId: string;
  spotifyUri: string;
  title: string;
  artist: string;
  albumImageUrl: string | null;
};

type SpotifySearchArtist = {
  id: string;
  uri: string;
  name: string;
  images?: Array<{ url?: string | null }>;
};

function isSpotifySearchArtist(item: unknown): item is SpotifySearchArtist {
  if (!item || typeof item !== "object") {
    return false;
  }

  const candidate = item as Partial<SpotifySearchArtist>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.uri === "string" &&
    typeof candidate.name === "string"
  );
}

function toSearchTrack(
  item: Parameters<typeof isSpotifyApiTrack>[0],
): SpotifySearchTrack | null {
  if (!isSpotifyApiTrack(item)) {
    return null;
  }

  return {
    spotifyId: item.id,
    spotifyUri: item.uri,
    title: item.name,
    artist: item.artists?.map((a) => a.name).join(", ") ?? "Desconhecido",
    albumImageUrl: item.album?.images?.[0]?.url ?? null,
  };
}

function escapeSpotifySearchValue(value: string): string {
  return value.replace(/["\\]/g, " ").trim();
}

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
    .map((item) => toSearchTrack(item)!);
}

export async function searchCatalog(
  accessToken: string,
  query: string,
  limit = 10,
): Promise<CatalogSearchResult> {
  const sdk = sdkForAccessToken(accessToken);
  const cappedLimit = Math.min(Math.max(1, limit), 20) as MaxInt<50>;
  const result = await sdk.search(
    query,
    ["track", "artist"],
    undefined,
    cappedLimit,
  );

  const tracks = (result.tracks?.items ?? [])
    .map(toSearchTrack)
    .filter((track): track is SpotifySearchTrack => Boolean(track));

  const artists = (result.artists?.items ?? [])
    .filter(isSpotifySearchArtist)
    .slice(0, 4)
    .map((artist) => ({
      spotifyId: artist.id,
      spotifyUri: artist.uri,
      name: artist.name,
      imageUrl: artist.images?.[0]?.url ?? null,
    }));

  const artistTracks = await Promise.all(
    artists.slice(0, 3).map(async (artist) => {
      const artistQuery = escapeSpotifySearchValue(artist.name);
      if (!artistQuery) {
        return { artist, tracks: [] };
      }

      const artistResult = await sdk.search(
        `artist:"${artistQuery}"`,
        ["track"],
        undefined,
        5 as MaxInt<50>,
      );

      const groupedTracks = (artistResult.tracks?.items ?? [])
        .map(toSearchTrack)
        .filter((track): track is SpotifySearchTrack => Boolean(track))
        .slice(0, 5);

      return { artist, tracks: groupedTracks };
    }),
  );

  return {
    tracks,
    artists,
    artistTracks: artistTracks.filter((group) => group.tracks.length > 0),
  };
}
