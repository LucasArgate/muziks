-- Aligned with packages/db/migrations/0000_auth_players.sql (already applied remotely).
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" uuid PRIMARY KEY NOT NULL,
  "spotify_user_id" text UNIQUE,
  "display_name" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "players" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "display_name" text NOT NULL,
  "owner_id" uuid NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "status" text DEFAULT 'draft' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "players_status_check" CHECK ("status" IN ('draft', 'active', 'paused', 'archived')),
  CONSTRAINT "players_slug_reserved_check" CHECK (
    "slug" NOT IN ('login', 'logout', 'create', 'register', 'forget')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS "players_slug_unique" ON "players" ("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "players_owner_id_unique" ON "players" ("owner_id");

CREATE TABLE IF NOT EXISTS "spotify_connections" (
  "user_id" uuid PRIMARY KEY NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "refresh_token_enc" text NOT NULL,
  "access_token_enc" text,
  "expires_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "players" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "spotify_connections" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON "profiles";
CREATE POLICY "profiles_select_own" ON "profiles"
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON "profiles";
CREATE POLICY "profiles_update_own" ON "profiles"
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "players_select_own" ON "players";
CREATE POLICY "players_select_own" ON "players"
  FOR SELECT USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "players_insert_own" ON "players";
CREATE POLICY "players_insert_own" ON "players"
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "players_update_own" ON "players";
CREATE POLICY "players_update_own" ON "players"
  FOR UPDATE USING (auth.uid() = owner_id);
