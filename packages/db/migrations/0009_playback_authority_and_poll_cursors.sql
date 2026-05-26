ALTER TABLE "player_sessions"
  ADD COLUMN IF NOT EXISTS "state_source" text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS "authority" text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS "sdk_device_id" text,
  ADD COLUMN IF NOT EXISTS "browser_instance_id" text,
  ADD COLUMN IF NOT EXISTS "browser_visibility" text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS "browser_last_seen_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "source_updated_at" timestamptz;

ALTER TABLE "player_sessions"
  DROP CONSTRAINT IF EXISTS "player_sessions_state_source_check",
  DROP CONSTRAINT IF EXISTS "player_sessions_authority_check",
  DROP CONSTRAINT IF EXISTS "player_sessions_browser_visibility_check";

ALTER TABLE "player_sessions"
  ADD CONSTRAINT "player_sessions_state_source_check" CHECK (
    "state_source" IN ('sdk_browser', 'browser_api', 'worker_api', 'bridge', 'unknown')
  ),
  ADD CONSTRAINT "player_sessions_authority_check" CHECK (
    "authority" IN ('browser', 'worker', 'bridge', 'unknown')
  ),
  ADD CONSTRAINT "player_sessions_browser_visibility_check" CHECK (
    "browser_visibility" IN ('visible', 'hidden', 'unknown')
  );

CREATE TABLE IF NOT EXISTS "playback_poll_cursors" (
  "player_id" uuid PRIMARY KEY NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
  "next_tick_at" timestamptz DEFAULT now() NOT NULL,
  "retry_after_until" timestamptz,
  "failure_count" integer DEFAULT 0 NOT NULL,
  "locked_until" timestamptz,
  "last_tick_at" timestamptz,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "playback_poll_cursors_next_tick_idx"
  ON "playback_poll_cursors" ("next_tick_at");

ALTER TABLE "playback_poll_cursors" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "playback_poll_cursors_select_own" ON "playback_poll_cursors"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "players"
      WHERE "players"."id" = "playback_poll_cursors"."player_id"
        AND "players"."owner_id" = auth.uid()
    )
  );
