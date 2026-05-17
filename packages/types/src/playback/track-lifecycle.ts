import { z } from "zod";

export const playbackTrackEventTypes = [
  "track_started",
  "track_ended",
  "track_advanced",
  "track_idle",
  "track_paused",
  "track_resumed",
] as const;

export const playbackTrackEventTypeSchema = z.enum(playbackTrackEventTypes);

export type PlaybackTrackEventType = z.infer<typeof playbackTrackEventTypeSchema>;

export const playbackTrackLifecyclePhaseSchema = z.enum([
  "idle",
  "playing",
  "paused",
  "ended",
]);

export type PlaybackTrackLifecyclePhase = z.infer<
  typeof playbackTrackLifecyclePhaseSchema
>;

export const playbackTrackEventSchema = z.object({
  id: z.string().uuid(),
  playerId: z.string().uuid(),
  type: playbackTrackEventTypeSchema,
  trackUri: z.string().nullable(),
  spotifyTrackId: z.string().nullable(),
  startedAt: z.string().datetime().nullable(),
  occurredAt: z.string().datetime(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

export type PlaybackTrackEvent = z.infer<typeof playbackTrackEventSchema>;

export const playbackTrackEventBroadcastSchema = z.object({
  event: playbackTrackEventSchema,
});

export type PlaybackTrackEventBroadcast = z.infer<
  typeof playbackTrackEventBroadcastSchema
>;

export const PLAYBACK_TRACK_EVENT_BROADCAST = "playback.track_event" as const;
