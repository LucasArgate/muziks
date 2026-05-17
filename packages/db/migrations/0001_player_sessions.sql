CREATE TABLE IF NOT EXISTS "player_sessions" (
  "player_id" uuid PRIMARY KEY NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
  "spotify_user_id" text,
  "active_device_id" text,
  "current_track_uri" text,
  "track_name" text,
  "artist_name" text,
  "album_image_url" text,
  "progress_ms" integer DEFAULT 0 NOT NULL,
  "duration_ms" integer DEFAULT 0 NOT NULL,
  "paused" boolean DEFAULT true NOT NULL,
  "status" text DEFAULT 'idle' NOT NULL,
  "last_error" text,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "player_sessions_status_check" CHECK (
    "status" IN ('connected', 'ready', 'playing', 'paused', 'idle', 'error')
  )
);

ALTER TABLE "player_sessions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "player_sessions_select_own" ON "player_sessions"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "players"
      WHERE "players"."id" = "player_sessions"."player_id"
        AND "players"."owner_id" = auth.uid()
    )
  );

CREATE POLICY "player_sessions_insert_own" ON "player_sessions"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "players"
      WHERE "players"."id" = "player_sessions"."player_id"
        AND "players"."owner_id" = auth.uid()
    )
  );

CREATE POLICY "player_sessions_update_own" ON "player_sessions"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "players"
      WHERE "players"."id" = "player_sessions"."player_id"
        AND "players"."owner_id" = auth.uid()
    )
  );
