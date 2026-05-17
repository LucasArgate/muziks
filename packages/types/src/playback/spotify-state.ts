import { z } from "zod";

/** Estado normalizado do SDK — adaptador em apps/player converte para este contrato */
export const normalizedSpotifyPlayerStateSchema = z.object({
  trackUri: z.string().nullable(),
  trackName: z.string().nullable(),
  artistName: z.string().nullable(),
  positionMs: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative(),
  paused: z.boolean(),
  deviceId: z.string().nullable(),
});

export type NormalizedSpotifyPlayerState = z.infer<
  typeof normalizedSpotifyPlayerStateSchema
>;
