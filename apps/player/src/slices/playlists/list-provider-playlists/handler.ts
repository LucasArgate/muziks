import {
  getSpotifyPlaylistSnapshot,
  listSpotifyCurrentUserPlaylists,
} from "@muziks/spotify";
import { z } from "zod";

import { getOwnerSpotifyAccessToken } from "@/src/lib/spotify-token-resolver";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

const providerPlaylistIdSchema = z.string().min(1);

export async function listProviderPlaylistsHandler(rawQuery: unknown) {
  const parsed = querySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return {
      status: 400 as const,
      body: { error: "invalid_query", details: parsed.error.flatten() },
    };
  }

  const accessToken = await getOwnerSpotifyAccessToken();
  if (!accessToken) {
    return { status: 401 as const, body: { error: "spotify_not_connected" } };
  }

  const result = await listSpotifyCurrentUserPlaylists({
    accessToken,
    limit: parsed.data.limit,
    offset: parsed.data.offset,
  });

  return { status: 200 as const, body: result };
}

export async function getProviderPlaylistSnapshotHandler(
  rawProviderPlaylistId: unknown,
) {
  const parsed = providerPlaylistIdSchema.safeParse(rawProviderPlaylistId);
  if (!parsed.success) {
    return {
      status: 400 as const,
      body: { error: "invalid_provider_playlist_id" },
    };
  }

  const accessToken = await getOwnerSpotifyAccessToken();
  if (!accessToken) {
    return { status: 401 as const, body: { error: "spotify_not_connected" } };
  }

  const snapshot = await getSpotifyPlaylistSnapshot(accessToken, parsed.data);
  const { items, ...playlist } = snapshot;

  return { status: 200 as const, body: { playlist, items } };
}
