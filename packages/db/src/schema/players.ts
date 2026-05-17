import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { profiles } from "./profiles";

export const playerLifecycleStatusEnum = [
  "draft",
  "active",
  "paused",
  "archived",
] as const;

export const players = pgTable(
  "players",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    displayName: text("display_name").notNull(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("draft"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    discoveryRadiusM: integer("discovery_radius_m").notNull().default(500),
    geoDiscoveryEnabled: boolean("geo_discovery_enabled")
      .notNull()
      .default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("players_slug_unique").on(table.slug),
    uniqueIndex("players_owner_id_unique").on(table.ownerId),
  ],
);
