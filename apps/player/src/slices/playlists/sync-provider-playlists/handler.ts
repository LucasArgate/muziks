import {
  syncProviderPlaylistsInputSchema,
  syncProviderPlaylistsResponseSchema,
  type PlaylistProvider,
} from "@muziks/types";
import {
  upsertSyncedProviderPlaylist,
  type SyncedPlaylistItemInput,
} from "@muziks/db";
import { getSpotifyPlaylistSnapshot } from "@muziks/spotify";

import { getOwnerSpotifyAccessToken } from "@/src/lib/spotify-token-resolver";

function mapSpotifyItems(
  items: Awaited<ReturnType<typeof getSpotifyPlaylistSnapshot>>["items"],
): SyncedPlaylistItemInput[] {
  return items.map((item) => ({
    providerTrackId: item.providerTrackId,
    providerTrackUri: item.providerTrackUri,
    isrc: item.isrc,
    title: item.title,
    artist: item.artist,
    albumImageUrl: item.albumImageUrl,
    durationMs: item.durationMs,
    position: item.position,
  }));
}

export async function syncProviderPlaylistsHandler(
  playerId: string,
  rawBody: unknown,
) {
  const parsed = syncProviderPlaylistsInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      status: 400 as const,
      body: { error: "invalid_body", details: parsed.error.flatten() },
    };
  }

  const accessToken = await getOwnerSpotifyAccessToken();
  if (!accessToken) {
    return { status: 401 as const, body: { error: "spotify_not_connected" } };
  }

  const provider = parsed.data.provider as PlaylistProvider;
  const results = [];

  for (const providerPlaylistId of parsed.data.providerPlaylistIds) {
    try {
      if (provider !== "spotify") {
        throw new Error("unsupported_playlist_provider");
      }

      const snapshot = await getSpotifyPlaylistSnapshot(
        accessToken,
        providerPlaylistId,
      );
      const synced = await upsertSyncedProviderPlaylist({
        playerId,
        provider,
        providerPlaylistId: snapshot.providerPlaylistId,
        providerUri: snapshot.providerUri,
        name: snapshot.name,
        description: snapshot.description,
        imageUrl: snapshot.imageUrl,
        ownerName: snapshot.ownerName,
        tracksTotal: snapshot.tracksTotal,
        providerSnapshotId: snapshot.providerSnapshotId,
        items: mapSpotifyItems(snapshot.items),
      });

      results.push({
        provider,
        providerPlaylistId,
        playlist: synced.playlist,
        itemsSynced: synced.itemsSynced,
        skipped: synced.skipped,
        error: null,
      });
    } catch (error) {
      results.push({
        provider,
        providerPlaylistId,
        playlist: null,
        itemsSynced: 0,
        skipped: false,
        error: error instanceof Error ? error.message : "playlist_sync_error",
      });
    }
  }

  const body = syncProviderPlaylistsResponseSchema.parse({ results });
  return { status: 200 as const, body };
}
