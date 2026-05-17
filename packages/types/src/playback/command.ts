import { z } from "zod";

export const playbackCommandTypes = [
  "play",
  "pause",
  "next",
  "seek",
] as const;

export type PlaybackCommandType = (typeof playbackCommandTypes)[number];

export const playbackCommandStatusSchema = z.enum([
  "pending",
  "applied",
  "failed",
]);

export type PlaybackCommandStatus = z.infer<typeof playbackCommandStatusSchema>;

export const playbackCommandSchema = z.object({
  id: z.string().uuid(),
  playerId: z.string().uuid(),
  type: z.enum(playbackCommandTypes),
  payload: z.record(z.unknown()).nullable(),
  status: playbackCommandStatusSchema,
  createdBy: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});

export type PlaybackCommand = z.infer<typeof playbackCommandSchema>;
