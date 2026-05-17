import { z } from "zod";

import { normalizedSpotifyPlayerStateSchema } from "./spotify-state";

export const sessionSnapshotBroadcastSchema = z.object({
  playback: normalizedSpotifyPlayerStateSchema,
  stateVersion: z.number().int().nonnegative(),
});

export type SessionSnapshotBroadcast = z.infer<
  typeof sessionSnapshotBroadcastSchema
>;

export const PLAYER_SESSION_BROADCAST_EVENT = "session.snapshot" as const;
