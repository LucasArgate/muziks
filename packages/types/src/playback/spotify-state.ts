import { z } from "zod";

import { playbackSessionStatusSchema } from "./session";
import { playbackSyncModeSchema } from "./sync-mode";

/** Estado normalizado do SDK — adaptador em apps/player converte para este contrato */
export const normalizedSpotifyPlayerStateSchema = z.object({
  trackUri: z.string().nullable(),
  trackName: z.string().nullable(),
  artistName: z.string().nullable(),
  albumImageUrl: z.string().nullable().optional(),
  positionMs: z.number().int().nonnegative(),
  /** Epoch ms em que `positionMs` foi medido ou normalizado localmente. */
  positionUpdatedAt: z.number().int().nonnegative().optional(),
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
    syncMode: playbackSyncModeSchema.optional(),
    preferredDeviceId: z.string().nullable().optional(),
    activeDeviceName: z.string().nullable().optional(),
    stateVersion: z.number().int().nonnegative().optional(),
  });

export type PublishPlaybackSessionInput = z.infer<
  typeof publishPlaybackSessionInputSchema
>;
