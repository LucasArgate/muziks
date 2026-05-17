import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { players } from "./players";

export const playerSessionStatusEnum = [
  "connected",
  "ready",
  "playing",
  "paused",
  "idle",
  "error",
] as const;

export const playerSessions = pgTable("player_sessions", {
  playerId: uuid("player_id")
    .primaryKey()
    .references(() => players.id, { onDelete: "cascade" }),
  spotifyUserId: text("spotify_user_id"),
  activeDeviceId: text("active_device_id"),
  currentTrackUri: text("current_track_uri"),
  trackName: text("track_name"),
  artistName: text("artist_name"),
  albumImageUrl: text("album_image_url"),
  progressMs: integer("progress_ms").notNull().default(0),
  durationMs: integer("duration_ms").notNull().default(0),
  paused: boolean("paused").notNull().default(true),
  status: text("status").notNull().default("idle"),
  lastError: text("last_error"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
