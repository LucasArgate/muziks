CREATE TABLE IF NOT EXISTS "queue_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
  "spotify_uri" text NOT NULL,
  "isrc" text,
  "title" text NOT NULL,
  "artist" text NOT NULL,
  "votes" integer DEFAULT 0 NOT NULL,
  "position" integer NOT NULL,
  "state" text DEFAULT 'queued' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "queue_items_state_check" CHECK (
    "state" IN ('pending', 'queued', 'playing', 'played', 'removed')
  )
);

CREATE INDEX IF NOT EXISTS "queue_items_player_state_position_idx"
  ON "queue_items" ("player_id", "state", "position");

CREATE TABLE IF NOT EXISTS "queue_dequeue_ledger" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "player_id" uuid NOT NULL REFERENCES "players"("id") ON DELETE CASCADE,
  "idempotency_key" text NOT NULL,
  "result" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "queue_dequeue_ledger_player_key_unique"
    UNIQUE ("player_id", "idempotency_key")
);

ALTER TABLE "queue_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "queue_dequeue_ledger" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "queue_items_select_public" ON "queue_items";
CREATE POLICY "queue_items_select_public" ON "queue_items"
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "queue_items_owner_write" ON "queue_items";
CREATE POLICY "queue_items_owner_write" ON "queue_items"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "players"
      WHERE "players"."id" = "queue_items"."player_id"
        AND "players"."owner_id" = auth.uid()
    )
  );

DROP POLICY IF EXISTS "queue_dequeue_ledger_owner" ON "queue_dequeue_ledger";
CREATE POLICY "queue_dequeue_ledger_owner" ON "queue_dequeue_ledger"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "players"
      WHERE "players"."id" = "queue_dequeue_ledger"."player_id"
        AND "players"."owner_id" = auth.uid()
    )
  );
