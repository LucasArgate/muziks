import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { players } from "./players";

export const playbackTrackLifecyclePhaseEnum = [
  "idle",
  "playing",
  "paused",
  "ended",
] as const;

export const playbackTrackLifecycle = pgTable("playback_track_lifecycle", {
  playerId: uuid("player_id")
    .primaryKey()
    .references(() => players.id, { onDelete: "cascade" }),
  activeTrackUri: text("active_track_uri"),
  activeSpotifyTrackId: text("active_spotify_track_id"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  positionAtStartMs: integer("position_at_start_ms").notNull().default(0),
  durationMs: integer("duration_ms").notNull().default(0),
  expectedEndAt: timestamp("expected_end_at", { withTimezone: true }),
  phase: text("phase").notNull().default("idle"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const playbackTrackEventTypeEnum = [
  "track_started",
  "track_ended",
  "track_advanced",
  "track_idle",
  "track_paused",
  "track_resumed",
] as const;

export const playbackTrackEvents = pgTable(
  "playback_track_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    trackUri: text("track_uri"),
    spotifyTrackId: text("spotify_track_id"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    metadata: text("metadata"),
  },
  (table) => [
    uniqueIndex("playback_track_events_idempotent").on(
      table.playerId,
      table.type,
      table.spotifyTrackId,
      table.startedAt,
    ),
  ],
);
