-- Playback worker: pg_cron invokes Edge Function `playback-sync` every minute.
-- Configure after deploy (Dashboard → Database → Extensions: pg_cron, pg_net):
--
--   ALTER DATABASE postgres SET app.playback_sync_function_url =
--     'https://<project-ref>.supabase.co/functions/v1/playback-sync';
--
-- Edge Function secrets (Dashboard → Edge Functions → playback-sync):
--   PLAYER_APP_URL, PLAYBACK_WORKER_SECRET (same value as apps/player)

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'playback-sync') THEN
    PERFORM cron.unschedule((SELECT jobid FROM cron.job WHERE jobname = 'playback-sync' LIMIT 1));
  END IF;
END $$;

SELECT cron.schedule(
  'playback-sync',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := coalesce(
      nullif(current_setting('app.playback_sync_function_url', true), ''),
      'http://host.docker.internal:54321/functions/v1/playback-sync'
    ),
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
