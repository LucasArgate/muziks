import { z } from "zod";

import {
  playbackAuthoritySchema,
  playbackStateSourceSchema,
} from "./session";
import { normalizedSpotifyPlayerStateSchema } from "./spotify-state";

export const sessionSnapshotBroadcastSchema = z.object({
  playback: normalizedSpotifyPlayerStateSchema,
  stateVersion: z.number().int().nonnegative(),
  stateSource: playbackStateSourceSchema.optional(),
  authority: playbackAuthoritySchema.optional(),
  sourceUpdatedAt: z.string().datetime().nullable().optional(),
});

export type SessionSnapshotBroadcast = z.infer<
  typeof sessionSnapshotBroadcastSchema
>;

export const PLAYER_SESSION_BROADCAST_EVENT = "session.snapshot" as const;
