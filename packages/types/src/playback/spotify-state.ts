import { z } from "zod";

import { playbackSessionStatusSchema } from "./session";

/** Estado normalizado do SDK — adaptador em apps/player converte para este contrato */
export const normalizedSpotifyPlayerStateSchema = z.object({
  trackUri: z.string().nullable(),
  trackName: z.string().nullable(),
  artistName: z.string().nullable(),
  albumImageUrl: z.string().nullable().optional(),
  positionMs: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative(),
  paused: z.boolean(),
  deviceId: z.string().nullable(),
  status: playbackSessionStatusSchema.optional(),
  lastError: z.string().nullable().optional(),
});

export type NormalizedSpotifyPlayerState = z.infer<
  typeof normalizedSpotifyPlayerStateSchema
>;

export const publishPlaybackSessionInputSchema =
  normalizedSpotifyPlayerStateSchema.extend({
    status: playbackSessionStatusSchema,
    spotifyUserId: z.string().nullable().optional(),
  });

export type PublishPlaybackSessionInput = z.infer<
  typeof publishPlaybackSessionInputSchema
>;
