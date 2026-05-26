import {
  integer,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { players } from "./players";

export const playbackPollCursors = pgTable("playback_poll_cursors", {
  playerId: uuid("player_id")
    .primaryKey()
    .references(() => players.id, { onDelete: "cascade" }),
  nextTickAt: timestamp("next_tick_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  retryAfterUntil: timestamp("retry_after_until", { withTimezone: true }),
  failureCount: integer("failure_count").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  lastTickAt: timestamp("last_tick_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
