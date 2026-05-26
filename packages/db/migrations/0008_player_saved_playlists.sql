CREATE TABLE IF NOT EXISTS "player_saved_playlists" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
  "provider" text DEFAULT 'spotify' NOT NULL,
  "provider_playlist_id" text NOT NULL,
  "provider_uri" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "image_url" text,
  "owner_name" text,
  "tracks_total" integer DEFAULT 0 NOT NULL,
  "provider_snapshot_id" text,
  "is_default" boolean DEFAULT false NOT NULL,
  "last_synced_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "player_saved_playlists_provider_check" CHECK (
    "provider" IN ('spotify')
  )
);

CREATE INDEX IF NOT EXISTS "player_saved_playlists_player_id_idx"
  ON "player_saved_playlists" ("player_id");

CREATE UNIQUE INDEX IF NOT EXISTS "player_saved_playlists_provider_unique"
  ON "player_saved_playlists" ("player_id", "provider", "provider_playlist_id");

CREATE UNIQUE INDEX IF NOT EXISTS "player_saved_playlists_default_unique"
  ON "player_saved_playlists" ("player_id")
  WHERE "is_default" = true;

CREATE TABLE IF NOT EXISTS "player_saved_playlist_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "playlist_id" uuid NOT NULL REFERENCES "player_saved_playlists"("id") ON DELETE CASCADE,
  "provider_track_id" text,
  "provider_track_uri" text NOT NULL,
  "isrc" text,
  "title" text NOT NULL,
  "artist" text NOT NULL,
  "album_image_url" text,
  "duration_ms" integer DEFAULT 0 NOT NULL,
  "position" integer NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "player_saved_playlist_items_playlist_id_idx"
  ON "player_saved_playlist_items" ("playlist_id");

CREATE UNIQUE INDEX IF NOT EXISTS "player_saved_playlist_items_position_unique"
  ON "player_saved_playlist_items" ("playlist_id", "position");

ALTER TABLE "player_saved_playlists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "player_saved_playlist_items" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "player_saved_playlists_owner" ON "player_saved_playlists";
CREATE POLICY "player_saved_playlists_owner" ON "player_saved_playlists"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "players"
      WHERE "players"."id" = "player_saved_playlists"."player_id"
        AND "players"."owner_id" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "player_saved_playlist_items_owner" ON "player_saved_playlist_items";
CREATE POLICY "player_saved_playlist_items_owner" ON "player_saved_playlist_items"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "player_saved_playlists"
      INNER JOIN "players"
        ON "players"."id" = "player_saved_playlists"."player_id"
      WHERE "player_saved_playlists"."id" = "player_saved_playlist_items"."playlist_id"
        AND "players"."owner_id" = auth.uid()
    )
  );
