ALTER TABLE "playback_track_lifecycle"
  DROP CONSTRAINT IF EXISTS "playback_track_lifecycle_phase_check";

ALTER TABLE "playback_track_lifecycle"
  ADD CONSTRAINT "playback_track_lifecycle_phase_check" CHECK (
    "phase" IN ('idle', 'playing', 'paused', 'ended')
  );

ALTER TABLE "playback_track_events"
  DROP CONSTRAINT IF EXISTS "playback_track_events_type_check";

ALTER TABLE "playback_track_events"
  ADD CONSTRAINT "playback_track_events_type_check" CHECK (
    "type" IN (
      'track_started',
      'track_ended',
      'track_advanced',
      'track_idle',
      'track_paused',
      'track_resumed'
    )
  );
