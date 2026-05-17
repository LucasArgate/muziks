import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { players } from "./players";

export const queueItemStateEnum = [
  "pending",
  "queued",
  "playing",
  "played",
  "removed",
] as const;

export const queueItems = pgTable("queue_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  spotifyUri: text("spotify_uri").notNull(),
  isrc: text("isrc"),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  votes: integer("votes").notNull().default(0),
  position: integer("position").notNull(),
  state: text("state").notNull().default("queued"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const queueDequeueLedger = pgTable("queue_dequeue_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  playerId: uuid("player_id")
    .notNull()
    .references(() => players.id, { onDelete: "cascade" }),
  idempotencyKey: text("idempotency_key").notNull(),
  result: text("result").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
