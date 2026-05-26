import { z } from "zod";

import { playbackSyncModeSchema } from "./sync-mode";

export const playbackSessionStatusSchema = z.enum([
  "connected",
  "ready",
  "playing",
  "paused",
  "idle",
  "error",
]);

export type PlaybackSessionStatus = z.infer<typeof playbackSessionStatusSchema>;

export const playbackStateSourceSchema = z.enum([
  "sdk_browser",
  "browser_api",
  "worker_api",
  "bridge",
  "unknown",
]);

export const playbackAuthoritySchema = z.enum([
  "browser",
  "worker",
  "bridge",
  "unknown",
]);

export const browserVisibilitySchema = z.enum([
  "visible",
  "hidden",
  "unknown",
]);

export type PlaybackStateSource = z.infer<typeof playbackStateSourceSchema>;
export type PlaybackAuthority = z.infer<typeof playbackAuthoritySchema>;
export type BrowserVisibility = z.infer<typeof browserVisibilitySchema>;

/** Snapshot de playback — alinhado a docs/mvp/06-arquitetura-playback-spotify.md §6.1 */
export const playbackSessionSchema = z.object({
  playerId: z.string().uuid(),
  spotifyUserId: z.string().nullable(),
  activeDeviceId: z.string().nullable(),
  currentTrackUri: z.string().nullable(),
  trackName: z.string().nullable(),
  artistName: z.string().nullable(),
  albumImageUrl: z.string().nullable(),
  progressMs: z.number().int().nonnegative(),
  durationMs: z.number().int().nonnegative(),
  paused: z.boolean(),
  status: playbackSessionStatusSchema,
  lastError: z.string().nullable(),
  syncMode: playbackSyncModeSchema,
  preferredDeviceId: z.string().nullable(),
  activeDeviceName: z.string().nullable(),
  stateSource: playbackStateSourceSchema,
  authority: playbackAuthoritySchema,
  sdkDeviceId: z.string().nullable(),
  browserInstanceId: z.string().nullable(),
  browserVisibility: browserVisibilitySchema,
  browserLastSeenAt: z.string().datetime().nullable(),
  sourceUpdatedAt: z.string().datetime().nullable(),
  stateVersion: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});

export type PlaybackSession = z.infer<typeof playbackSessionSchema>;
