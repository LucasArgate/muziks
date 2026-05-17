import { z } from "zod";

import { ownerAuthStateSchema } from "../auth/owner-session";
import { spotifyConnectionStateSchema } from "../auth/session-view";
import { normalizedSpotifyPlayerStateSchema } from "../playback/spotify-state";

export const playerMasterViewStateSchema = z.object({
  muziks: ownerAuthStateSchema,
  spotify: spotifyConnectionStateSchema,
  playback: normalizedSpotifyPlayerStateSchema.nullable().optional(),
});

export type PlayerMasterViewState = z.infer<typeof playerMasterViewStateSchema>;
