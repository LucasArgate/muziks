import { z } from "zod";

export const mirrorNextToSpotifyQueueInputSchema = z.object({
  deviceId: z.string().optional(),
  lookahead: z.number().int().min(1).max(3).optional(),
  currentTrackUri: z.string().nullable().optional(),
});

export type MirrorNextToSpotifyQueueInput = z.infer<
  typeof mirrorNextToSpotifyQueueInputSchema
>;

export const mirrorNextToSpotifyQueueResultSchema = z.object({
  mirrored: z.boolean(),
  reason: z.enum([
    "mirrored",
    "already_queued",
    "empty_queue",
    "spotify_error",
    "no_token",
  ]),
  queuedUris: z.array(z.string()),
  skippedUris: z.array(z.string()),
});

export type MirrorNextToSpotifyQueueResult = z.infer<
  typeof mirrorNextToSpotifyQueueResultSchema
>;
