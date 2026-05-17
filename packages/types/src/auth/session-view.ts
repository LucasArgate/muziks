import { z } from "zod";

import { profileSummarySchema } from "../player/entity";

export const spotifyConnectionStateSchema = z.enum([
  "disconnected",
  "connected",
  "expired",
]);

export type SpotifyConnectionState = z.infer<
  typeof spotifyConnectionStateSchema
>;

export const muziksSessionViewSchema = z.object({
  status: z.enum(["anonymous", "authenticated", "authenticated_no_player"]),
  userId: z.string().uuid().nullable(),
  profile: profileSummarySchema.nullable(),
  playerSlug: z.string().nullable(),
  spotify: spotifyConnectionStateSchema,
});

export type MuziksSessionView = z.infer<typeof muziksSessionViewSchema>;

export const createPlayerInputSchema = z.object({
  slug: z.string().min(3).max(50),
  displayName: z.string().min(1).max(120),
});

export type CreatePlayerInput = z.infer<typeof createPlayerInputSchema>;
