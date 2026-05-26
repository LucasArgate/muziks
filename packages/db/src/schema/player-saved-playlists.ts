import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { players } from "./players";

export const playerSavedPlaylists = pgTable(
  "player_saved_playlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("spotify"),
    providerPlaylistId: text("provider_playlist_id").notNull(),
    providerUri: text("provider_uri").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    ownerName: text("owner_name"),
    tracksTotal: integer("tracks_total").notNull().default(0),
    providerSnapshotId: text("provider_snapshot_id"),
    isDefault: boolean("is_default").notNull().default(false),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("player_saved_playlists_player_id_idx").on(table.playerId),
    uniqueIndex("player_saved_playlists_provider_unique").on(
      table.playerId,
      table.provider,
      table.providerPlaylistId,
    ),
    uniqueIndex("player_saved_playlists_default_unique")
      .on(table.playerId)
      .where(sql`${table.isDefault} = true`),
  ],
);

export const playerSavedPlaylistItems = pgTable(
  "player_saved_playlist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playlistId: uuid("playlist_id")
      .notNull()
      .references(() => playerSavedPlaylists.id, { onDelete: "cascade" }),
    providerTrackId: text("provider_track_id"),
    providerTrackUri: text("provider_track_uri").notNull(),
    isrc: text("isrc"),
    title: text("title").notNull(),
    artist: text("artist").notNull(),
    albumImageUrl: text("album_image_url"),
    durationMs: integer("duration_ms").notNull().default(0),
    position: integer("position").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("player_saved_playlist_items_playlist_id_idx").on(table.playlistId),
    uniqueIndex("player_saved_playlist_items_position_unique").on(
      table.playlistId,
      table.position,
    ),
  ],
);
