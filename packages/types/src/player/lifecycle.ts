import { z } from "zod";

export const playerLifecycleStatuses = [
  "draft",
  "active",
  "paused",
  "archived",
] as const;

export type PlayerLifecycleStatus = (typeof playerLifecycleStatuses)[number];

export const playerLifecycleStatusSchema = z.enum(playerLifecycleStatuses);
