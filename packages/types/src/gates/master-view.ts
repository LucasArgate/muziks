import { z } from "zod";

import { ownerAuthStateSchema } from "../auth/owner-session";
import { spotifyConnectionStateSchema } from "../auth/session-view";
import { playbackSyncModeSchema } from "../playback/sync-mode";
import { normalizedSpotifyPlayerStateSchema } from "../playback/spotify-state";

export const playerMasterSessionMetaSchema = z.object({
  syncMode: playbackSyncModeSchema,
  preferredDeviceId: z.string().nullable(),
  activeDeviceName: z.string().nullable(),
  stateVersion: z.number().int().nonnegative(),
});

export type PlayerMasterSessionMeta = z.infer<
  typeof playerMasterSessionMetaSchema
>;

export const playerMasterViewStateSchema = z.object({
  muziks: ownerAuthStateSchema,
  spotify: spotifyConnectionStateSchema,
  playback: normalizedSpotifyPlayerStateSchema.nullable().optional(),
  sessionMeta: playerMasterSessionMetaSchema.nullable().optional(),
});

export type PlayerMasterViewState = z.infer<typeof playerMasterViewStateSchema>;
