import { z } from "zod";

import { playerLifecycleStatusSchema } from "./lifecycle";

export const profileSchema = z.object({
  id: z.string().uuid(),
  spotifyUserId: z.string().nullable(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  email: z.string().email().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Profile = z.infer<typeof profileSchema>;

export const profileSummarySchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().nullable(),
  spotifyUserId: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  email: z.string().email().nullable(),
});

export type ProfileSummary = z.infer<typeof profileSummarySchema>;

export const playerSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  displayName: z.string(),
  ownerId: z.string().uuid(),
  status: playerLifecycleStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Player = z.infer<typeof playerSchema>;

export const playerSummarySchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  displayName: z.string(),
  status: playerLifecycleStatusSchema,
});

export type PlayerSummary = z.infer<typeof playerSummarySchema>;
