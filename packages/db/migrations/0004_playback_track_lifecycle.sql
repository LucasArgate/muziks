CREATE TABLE IF NOT EXISTS "playback_track_lifecycle" (
  "player_id" uuid PRIMARY KEY NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
  "active_track_uri" text,
  "active_spotify_track_id" text,
  "started_at" timestamptz,
  "position_at_start_ms" integer DEFAULT 0 NOT NULL,
  "duration_ms" integer DEFAULT 0 NOT NULL,
  "expected_end_at" timestamptz,
  "phase" text DEFAULT 'idle' NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "playback_track_lifecycle_phase_check" CHECK (
    "phase" IN ('idle', 'playing', 'ended')
  )
);

CREATE TABLE IF NOT EXISTS "playback_track_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
  "type" text NOT NULL,
  "track_uri" text,
  "spotify_track_id" text,
  "started_at" timestamptz,
  "occurred_at" timestamptz DEFAULT now() NOT NULL,
  "metadata" text,
  CONSTRAINT "playback_track_events_type_check" CHECK (
    "type" IN ('track_started', 'track_ended', 'track_advanced', 'track_idle')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS "playback_track_events_idempotent"
  ON "playback_track_events" ("player_id", "type", "spotify_track_id", "started_at");

ALTER TABLE "playback_track_lifecycle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "playback_track_events" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playback_track_lifecycle_select_own" ON "playback_track_lifecycle"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "players"
      WHERE "players"."id" = "playback_track_lifecycle"."player_id"
        AND "players"."owner_id" = auth.uid()
    )
  );

CREATE POLICY "playback_track_events_select_own" ON "playback_track_events"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "players"
      WHERE "players"."id" = "playback_track_events"."player_id"
        AND "players"."owner_id" = auth.uid()
    )
  );
