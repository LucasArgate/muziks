import { z } from "zod";

export const discoverPlayerCardSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  displayName: z.string(),
  distanceM: z.number().int().nonnegative().optional(),
});

export type DiscoverPlayerCard = z.infer<typeof discoverPlayerCardSchema>;
