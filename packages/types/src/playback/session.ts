import { z } from "zod";

export const playbackSessionStatusSchema = z.enum([
  "playing",
  "paused",
  "idle",
]);

export type PlaybackSessionStatus = z.infer<typeof playbackSessionStatusSchema>;

/** Stub alinhado a docs/mvp/06-arquitetura-playback-spotify.md §6.1 */
export const playbackSessionSchema = z.object({
  playerId: z.string().uuid(),
  activeDeviceId: z.string().nullable(),
  spotifyUserId: z.string().nullable(),
  currentTrackUri: z.string().nullable(),
  progressMs: z.number().int().nonnegative(),
  status: playbackSessionStatusSchema,
  updatedAt: z.string().datetime(),
});

export type PlaybackSession = z.infer<typeof playbackSessionSchema>;
