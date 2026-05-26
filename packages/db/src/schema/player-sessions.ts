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

export const playerSessionSyncModeEnum = [
  "api_device",
  "sdk",
  "hybrid",
] as const;

export const playerSessionStateSourceEnum = [
  "sdk_browser",
  "browser_api",
  "worker_api",
  "bridge",
  "unknown",
] as const;

export const playerSessionAuthorityEnum = [
  "browser",
  "worker",
  "bridge",
  "unknown",
] as const;

export const playerSessionBrowserVisibilityEnum = [
  "visible",
  "hidden",
  "unknown",
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
  syncMode: text("sync_mode").notNull().default("api_device"),
  preferredDeviceId: text("preferred_device_id"),
  activeDeviceName: text("active_device_name"),
  stateSource: text("state_source").notNull().default("unknown"),
  authority: text("authority").notNull().default("unknown"),
  sdkDeviceId: text("sdk_device_id"),
  browserInstanceId: text("browser_instance_id"),
  browserVisibility: text("browser_visibility").notNull().default("unknown"),
  browserLastSeenAt: timestamp("browser_last_seen_at", { withTimezone: true }),
  sourceUpdatedAt: timestamp("source_updated_at", { withTimezone: true }),
  stateVersion: integer("state_version").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
