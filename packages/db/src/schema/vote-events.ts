import { pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { players } from "./players";
import { profiles } from "./profiles";
import { queueItems } from "./queue-items";

export const voteEvents = pgTable(
  "vote_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    queueItemId: uuid("queue_item_id")
      .notNull()
      .references(() => queueItems.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("vote_events_profile_queue_item_unique").on(
      table.profileId,
      table.queueItemId,
    ),
  ],
);
