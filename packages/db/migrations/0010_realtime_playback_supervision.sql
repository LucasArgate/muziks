-- Enable postgres_changes for worker supervision (Supabase Realtime).
-- Safe to run multiple times: ignores tables already in the publication.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'player_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.player_sessions;
  END IF;
END $$;
