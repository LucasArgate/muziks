import { SPOTIFY_API_BASE } from "./constants";
import { spotifyFetch } from "./api";

export type SpotifySearchTrack = {
  spotifyUri: string;
  title: string;
  artist: string;
  albumImageUrl: string | null;
};

type SpotifySearchResponse = {
  tracks?: {
    items?: Array<{
      uri: string;
      name: string;
      artists?: Array<{ name: string }>;
      album?: { images?: Array<{ url: string }> };
    }>;
  };
};

export async function searchTracks(
  accessToken: string,
  query: string,
  limit = 12,
): Promise<SpotifySearchTrack[]> {
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: String(Math.min(limit, 20)),
  });

  const response = await spotifyFetch<SpotifySearchResponse>(
    `${SPOTIFY_API_BASE}/search?${params.toString()}`,
    { accessToken },
  );

  return (response.tracks?.items ?? []).map((item) => ({
    spotifyUri: item.uri,
    title: item.name,
    artist: item.artists?.map((a) => a.name).join(", ") ?? "Desconhecido",
    albumImageUrl: item.album?.images?.[0]?.url ?? null,
  }));
}
