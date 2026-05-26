import type {
  PlaylistProvider,
  SavedProviderPlaylist,
  SavedProviderPlaylistItem,
  SavedProviderPlaylistWithItems,
} from "@muziks/types";
import { and, asc, eq, inArray } from "drizzle-orm";

import { getDb } from "../client";
import {
  playerSavedPlaylistItems,
  playerSavedPlaylists,
} from "../schema/player-saved-playlists";

export type SavedPlaylistRow = typeof playerSavedPlaylists.$inferSelect;
export type SavedPlaylistItemRow = typeof playerSavedPlaylistItems.$inferSelect;

export type SyncedPlaylistItemInput = {
  providerTrackId: string | null;
  providerTrackUri: string;
  isrc: string | null;
  title: string;
  artist: string;
  albumImageUrl: string | null;
  durationMs: number;
  position: number;
};

export type UpsertSyncedPlaylistInput = {
  playerId: string;
  provider: PlaylistProvider;
  providerPlaylistId: string;
  providerUri: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  ownerName: string | null;
  tracksTotal: number;
  providerSnapshotId: string | null;
  items: SyncedPlaylistItemInput[];
};

export type UpsertSyncedPlaylistResult = {
  playlist: SavedProviderPlaylist;
  itemsSynced: number;
  skipped: boolean;
};

export function toSavedProviderPlaylistDto(
  row: SavedPlaylistRow,
): SavedProviderPlaylist {
  return {
    id: row.id,
    playerId: row.playerId,
    provider: row.provider as PlaylistProvider,
    providerPlaylistId: row.providerPlaylistId,
    providerUri: row.providerUri,
    name: row.name,
    description: row.description,
    imageUrl: row.imageUrl,
    ownerName: row.ownerName,
    tracksTotal: row.tracksTotal,
    providerSnapshotId: row.providerSnapshotId,
    isDefault: row.isDefault,
    lastSyncedAt: row.lastSyncedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toSavedProviderPlaylistItemDto(
  row: SavedPlaylistItemRow,
): SavedProviderPlaylistItem {
  return {
    id: row.id,
    playlistId: row.playlistId,
    providerTrackId: row.providerTrackId,
    providerTrackUri: row.providerTrackUri,
    isrc: row.isrc,
    title: row.title,
    artist: row.artist,
    albumImageUrl: row.albumImageUrl,
    durationMs: row.durationMs,
    position: row.position,
  };
}

export async function listSavedPlaylistsForPlayer(
  playerId: string,
): Promise<SavedProviderPlaylist[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(playerSavedPlaylists)
    .where(eq(playerSavedPlaylists.playerId, playerId))
    .orderBy(asc(playerSavedPlaylists.name));

  return rows.map(toSavedProviderPlaylistDto);
}

export async function listSavedPlaylistsByProviderIds(
  playerId: string,
  provider: PlaylistProvider,
  providerPlaylistIds: string[],
): Promise<SavedProviderPlaylist[]> {
  if (providerPlaylistIds.length === 0) {
    return [];
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(playerSavedPlaylists)
    .where(
      and(
        eq(playerSavedPlaylists.playerId, playerId),
        eq(playerSavedPlaylists.provider, provider),
        inArray(playerSavedPlaylists.providerPlaylistId, providerPlaylistIds),
      ),
    );

  return rows.map(toSavedProviderPlaylistDto);
}

export async function getDefaultSavedPlaylistForPlayer(
  playerId: string,
): Promise<SavedProviderPlaylist | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(playerSavedPlaylists)
    .where(
      and(
        eq(playerSavedPlaylists.playerId, playerId),
        eq(playerSavedPlaylists.isDefault, true),
      ),
    )
    .limit(1);

  return rows[0] ? toSavedProviderPlaylistDto(rows[0]) : null;
}

export async function getSavedPlaylistWithItems(
  playerId: string,
  playlistId: string,
): Promise<SavedProviderPlaylistWithItems | null> {
  const db = getDb();
  const playlistRows = await db
    .select()
    .from(playerSavedPlaylists)
    .where(
      and(
        eq(playerSavedPlaylists.playerId, playerId),
        eq(playerSavedPlaylists.id, playlistId),
      ),
    )
    .limit(1);

  const playlist = playlistRows[0];
  if (!playlist) {
    return null;
  }

  const itemRows = await db
    .select()
    .from(playerSavedPlaylistItems)
    .where(eq(playerSavedPlaylistItems.playlistId, playlist.id))
    .orderBy(asc(playerSavedPlaylistItems.position));

  return {
    ...toSavedProviderPlaylistDto(playlist),
    items: itemRows.map(toSavedProviderPlaylistItemDto),
  };
}

export async function setDefaultSavedPlaylistForPlayer(
  playerId: string,
  playlistId: string,
): Promise<SavedProviderPlaylist | null> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const playlistRows = await tx
      .select()
      .from(playerSavedPlaylists)
      .where(
        and(
          eq(playerSavedPlaylists.playerId, playerId),
          eq(playerSavedPlaylists.id, playlistId),
        ),
      )
      .limit(1)
      .for("update");

    const playlist = playlistRows[0];
    if (!playlist) {
      return null;
    }

    const now = new Date();
    await tx
      .update(playerSavedPlaylists)
      .set({ isDefault: false, updatedAt: now })
      .where(eq(playerSavedPlaylists.playerId, playerId));

    const updatedRows = await tx
      .update(playerSavedPlaylists)
      .set({ isDefault: true, updatedAt: now })
      .where(eq(playerSavedPlaylists.id, playlistId))
      .returning();

    return updatedRows[0]
      ? toSavedProviderPlaylistDto(updatedRows[0])
      : null;
  });
}

export async function upsertSyncedProviderPlaylist(
  input: UpsertSyncedPlaylistInput,
): Promise<UpsertSyncedPlaylistResult> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const existingRows = await tx
      .select()
      .from(playerSavedPlaylists)
      .where(
        and(
          eq(playerSavedPlaylists.playerId, input.playerId),
          eq(playerSavedPlaylists.provider, input.provider),
          eq(
            playerSavedPlaylists.providerPlaylistId,
            input.providerPlaylistId,
          ),
        ),
      )
      .limit(1)
      .for("update");

    const existing = existingRows[0] ?? null;
    const now = new Date();

    if (
      existing &&
      input.providerSnapshotId &&
      existing.providerSnapshotId === input.providerSnapshotId
    ) {
      const updatedRows = await tx
        .update(playerSavedPlaylists)
        .set({
          providerUri: input.providerUri,
          name: input.name,
          description: input.description,
          imageUrl: input.imageUrl,
          ownerName: input.ownerName,
          tracksTotal: input.tracksTotal,
          updatedAt: now,
        })
        .where(eq(playerSavedPlaylists.id, existing.id))
        .returning();

      return {
        playlist: toSavedProviderPlaylistDto(updatedRows[0] ?? existing),
        itemsSynced: 0,
        skipped: true,
      };
    }

    const playlistRows = existing
      ? await tx
          .update(playerSavedPlaylists)
          .set({
            providerUri: input.providerUri,
            name: input.name,
            description: input.description,
            imageUrl: input.imageUrl,
            ownerName: input.ownerName,
            tracksTotal: input.tracksTotal,
            providerSnapshotId: input.providerSnapshotId,
            lastSyncedAt: now,
            updatedAt: now,
          })
          .where(eq(playerSavedPlaylists.id, existing.id))
          .returning()
      : await tx
          .insert(playerSavedPlaylists)
          .values({
            playerId: input.playerId,
            provider: input.provider,
            providerPlaylistId: input.providerPlaylistId,
            providerUri: input.providerUri,
            name: input.name,
            description: input.description,
            imageUrl: input.imageUrl,
            ownerName: input.ownerName,
            tracksTotal: input.tracksTotal,
            providerSnapshotId: input.providerSnapshotId,
            lastSyncedAt: now,
          })
          .returning();

    const playlist = playlistRows[0];

    await tx
      .delete(playerSavedPlaylistItems)
      .where(eq(playerSavedPlaylistItems.playlistId, playlist.id));

    if (input.items.length > 0) {
      await tx.insert(playerSavedPlaylistItems).values(
        input.items.map((item) => ({
          playlistId: playlist.id,
          providerTrackId: item.providerTrackId,
          providerTrackUri: item.providerTrackUri,
          isrc: item.isrc,
          title: item.title,
          artist: item.artist,
          albumImageUrl: item.albumImageUrl,
          durationMs: item.durationMs,
          position: item.position,
        })),
      );
    }

    return {
      playlist: toSavedProviderPlaylistDto(playlist),
      itemsSynced: input.items.length,
      skipped: false,
    };
  });
}
