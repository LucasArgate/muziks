import { z } from "zod";

import { playbackSessionStatusSchema } from "./session";

export const publicPlaybackSessionSchema = z.object({
  trackName: z.string().nullable(),
  artistName: z.string().nullable(),
  albumImageUrl: z.string().nullable(),
  progressMs: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative(),
  paused: z.boolean(),
  status: playbackSessionStatusSchema,
  stateVersion: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});

export type PublicPlaybackSession = z.infer<typeof publicPlaybackSessionSchema>;
