ALTER TABLE "player_sessions"
  ADD COLUMN IF NOT EXISTS "sync_mode" text NOT NULL DEFAULT 'api_device',
  ADD COLUMN IF NOT EXISTS "preferred_device_id" text,
  ADD COLUMN IF NOT EXISTS "active_device_name" text,
  ADD COLUMN IF NOT EXISTS "state_version" integer NOT NULL DEFAULT 0;

ALTER TABLE "player_sessions"
  DROP CONSTRAINT IF EXISTS "player_sessions_sync_mode_check";

ALTER TABLE "player_sessions"
  ADD CONSTRAINT "player_sessions_sync_mode_check" CHECK (
    "sync_mode" IN ('api_device', 'sdk', 'hybrid')
  );
