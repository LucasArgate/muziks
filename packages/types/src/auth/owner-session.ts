import { z } from "zod";

import { profileSummarySchema } from "../player/entity";
import { playerSummarySchema } from "../player/entity";

export const ownerAuthStateSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("anonymous") }),
  z.object({
    status: z.literal("authenticated"),
    userId: z.string().uuid(),
    profile: profileSummarySchema,
    player: playerSummarySchema,
  }),
  z.object({
    status: z.literal("authenticated_no_player"),
    userId: z.string().uuid(),
    profile: profileSummarySchema,
  }),
]);

export type OwnerAuthState = z.infer<typeof ownerAuthStateSchema>;
