import type { ProviderPlaylistSummary } from "@muziks/types";

import { SPOTIFY_API_BASE } from "./constants";
import { createSpotifyFetchWithRetry } from "./fetch-with-retry";

const PLAYLIST_PAGE_LIMIT = 50;

type SpotifyImage = {
  url?: string | null;
};

type SpotifyPlaylistOwner = {
  id?: string;
  display_name?: string | null;
};

type SpotifyPlaylistSummaryRaw = {
  id: string;
  uri: string;
  name: string;
  description?: string | null;
  images?: SpotifyImage[] | null;
  owner?: SpotifyPlaylistOwner | null;
  items?: { total?: number } | null;
  tracks?: { total?: number } | null;
  snapshot_id?: string | null;
  public?: boolean | null;
  collaborative?: boolean;
};

type SpotifyPaging<T> = {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
};

type SpotifyPlaylistTrackRaw = {
  is_local?: boolean;
  item?: SpotifyTrackRaw | null;
};

type SpotifyTrackRaw = {
  id?: string | null;
  uri?: string | null;
  type?: string;
  name?: string;
  duration_ms?: number;
  artists?: Array<{ name?: string }>;
  album?: {
    images?: SpotifyImage[] | null;
  } | null;
  external_ids?: {
    isrc?: string | null;
  } | null;
};

export type ListSpotifyPlaylistsParams = {
  accessToken: string;
  limit?: number;
  offset?: number;
};

export type SpotifyPlaylistTrackSnapshotItem = {
  providerTrackId: string | null;
  providerTrackUri: string;
  isrc: string | null;
  title: string;
  artist: string;
  albumImageUrl: string | null;
  durationMs: number;
  position: number;
};

export type SpotifyPlaylistSnapshot = ProviderPlaylistSummary & {
  items: SpotifyPlaylistTrackSnapshotItem[];
};

function pickImageUrl(images?: SpotifyImage[] | null): string | null {
  return images?.find((image) => image.url)?.url ?? null;
}

function normalizePlaylistSummary(
  playlist: SpotifyPlaylistSummaryRaw,
): ProviderPlaylistSummary {
  return {
    provider: "spotify",
    providerPlaylistId: playlist.id,
    providerUri: playlist.uri,
    name: playlist.name,
    description: playlist.description ?? null,
    imageUrl: pickImageUrl(playlist.images),
    ownerName: playlist.owner?.display_name ?? playlist.owner?.id ?? null,
    tracksTotal: playlist.items?.total ?? playlist.tracks?.total ?? 0,
    providerSnapshotId: playlist.snapshot_id ?? null,
    public: playlist.public ?? null,
    collaborative: playlist.collaborative ?? false,
  };
}

function normalizeTrackItem(
  item: SpotifyPlaylistTrackRaw,
  position: number,
): SpotifyPlaylistTrackSnapshotItem | null {
  const track = item.item;
  if (item.is_local || !track || track.type !== "track" || !track.uri) {
    return null;
  }

  return {
    providerTrackId: track.id ?? null,
    providerTrackUri: track.uri,
    isrc: track.external_ids?.isrc ?? null,
    title: track.name ?? "Faixa sem título",
    artist:
      track.artists
        ?.map((artist) => artist.name)
        .filter((name): name is string => Boolean(name))
        .join(", ") || "Artista desconhecido",
    albumImageUrl: pickImageUrl(track.album?.images),
    durationMs: track.duration_ms ?? 0,
    position,
  };
}

async function spotifyGetJson<T>(
  accessToken: string,
  path: string,
  searchParams?: Record<string, string | number>,
): Promise<T> {
  const url = new URL(`${SPOTIFY_API_BASE}${path}`);
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    url.searchParams.set(key, String(value));
  }

  const spotifyFetch = createSpotifyFetchWithRetry();
  const response = await spotifyFetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`spotify_api_${response.status}`);
  }

  return (await response.json()) as T;
}

export async function listSpotifyCurrentUserPlaylists({
  accessToken,
  limit = PLAYLIST_PAGE_LIMIT,
  offset = 0,
}: ListSpotifyPlaylistsParams): Promise<{
  playlists: ProviderPlaylistSummary[];
  total: number;
  nextOffset: number | null;
}> {
  const cappedLimit = Math.min(Math.max(1, limit), PLAYLIST_PAGE_LIMIT);
  const page = await spotifyGetJson<
    SpotifyPaging<SpotifyPlaylistSummaryRaw>
  >(accessToken, "/me/playlists", {
    limit: cappedLimit,
    offset,
  });

  const nextOffset = page.next ? page.offset + page.limit : null;

  return {
    playlists: page.items.map(normalizePlaylistSummary),
    total: page.total,
    nextOffset,
  };
}

export async function getSpotifyPlaylistSnapshot(
  accessToken: string,
  playlistId: string,
): Promise<SpotifyPlaylistSnapshot> {
  const playlist = await spotifyGetJson<SpotifyPlaylistSummaryRaw>(
    accessToken,
    `/playlists/${encodeURIComponent(playlistId)}`,
  );
  const summary = normalizePlaylistSummary(playlist);

  const items: SpotifyPlaylistTrackSnapshotItem[] = [];
  let offset = 0;

  while (true) {
    const page = await spotifyGetJson<SpotifyPaging<SpotifyPlaylistTrackRaw>>(
      accessToken,
      `/playlists/${encodeURIComponent(playlistId)}/tracks`,
      {
        limit: PLAYLIST_PAGE_LIMIT,
        offset,
      },
    );

    for (const rawItem of page.items) {
      const normalized = normalizeTrackItem(rawItem, items.length);
      if (normalized) {
        items.push(normalized);
      }
    }

    if (!page.next) {
      break;
    }

    offset += page.limit;
  }

  return {
    ...summary,
    items,
  };
}
