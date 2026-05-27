import { z } from "zod";

import { ownerAuthStateSchema } from "../auth/owner-session";
import { spotifyConnectionStateSchema } from "../auth/session-view";
import {
  playbackAuthoritySchema,
  playbackStateSourceSchema,
} from "../playback/session";
import { playbackSyncModeSchema } from "../playback/sync-mode";
import { normalizedSpotifyPlayerStateSchema } from "../playback/spotify-state";
import { savedProviderPlaylistSchema } from "../playlists/provider-playlist";

export const playerMasterSessionMetaSchema = z.object({
  syncMode: playbackSyncModeSchema,
  preferredDeviceId: z.string().nullable(),
  activeDeviceName: z.string().nullable(),
  stateVersion: z.number().int().nonnegative(),
  authority: playbackAuthoritySchema.optional(),
  stateSource: playbackStateSourceSchema.optional(),
  sourceUpdatedAt: z.string().datetime().nullable().optional(),
});

export type PlayerMasterSessionMeta = z.infer<
  typeof playerMasterSessionMetaSchema
>;

export const playerMasterViewStateSchema = z.object({
  muziks: ownerAuthStateSchema,
  spotify: spotifyConnectionStateSchema,
  playback: normalizedSpotifyPlayerStateSchema.nullable().optional(),
  sessionMeta: playerMasterSessionMetaSchema.nullable().optional(),
  defaultPlaylist: savedProviderPlaylistSchema.nullable().optional(),
});

export type PlayerMasterViewState = z.infer<typeof playerMasterViewStateSchema>;
