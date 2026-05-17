ALTER TABLE "players"
  ADD COLUMN IF NOT EXISTS "latitude" double precision,
  ADD COLUMN IF NOT EXISTS "longitude" double precision,
  ADD COLUMN IF NOT EXISTS "discovery_radius_m" integer NOT NULL DEFAULT 500,
  ADD COLUMN IF NOT EXISTS "geo_discovery_enabled" boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "vote_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
  "queue_item_id" uuid NOT NULL REFERENCES "queue_items"("id") ON DELETE CASCADE,
  "profile_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "vote_events_profile_queue_item_unique"
  ON "vote_events" ("profile_id", "queue_item_id");

CREATE INDEX IF NOT EXISTS "vote_events_player_id_idx"
  ON "vote_events" ("player_id");
