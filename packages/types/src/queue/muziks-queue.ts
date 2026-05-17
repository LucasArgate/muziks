import { z } from "zod";

export const queueItemStates = [
  "pending",
  "queued",
  "playing",
  "played",
  "removed",
] as const;

export const queueItemStateSchema = z.enum(queueItemStates);

export type QueueItemState = z.infer<typeof queueItemStateSchema>;

export const queueItemDtoSchema = z.object({
  id: z.string().uuid(),
  playerId: z.string().uuid(),
  spotifyUri: z.string(),
  isrc: z.string().nullable(),
  title: z.string(),
  artist: z.string(),
  votes: z.number().int().nonnegative(),
  position: z.number().int().nonnegative(),
  state: queueItemStateSchema,
  requestedAt: z.string().datetime(),
});

export type QueueItemDto = z.infer<typeof queueItemDtoSchema>;

export const muziksQueueSnapshotSchema = z.object({
  playerId: z.string().uuid(),
  version: z.number().int().nonnegative(),
  items: z.array(queueItemDtoSchema),
  updatedAt: z.string().datetime(),
});

export type MuziksQueueSnapshot = z.infer<typeof muziksQueueSnapshotSchema>;

export const dequeueNextQueueItemInputSchema = z.object({
  reason: z.string().max(120).optional(),
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export type DequeueNextQueueItemInput = z.infer<
  typeof dequeueNextQueueItemInputSchema
>;

export const dequeueNextQueueItemResultSchema = z.object({
  dequeued: queueItemDtoSchema.nullable(),
  head: queueItemDtoSchema.nullable(),
  snapshot: muziksQueueSnapshotSchema,
});

export type DequeueNextQueueItemResult = z.infer<
  typeof dequeueNextQueueItemResultSchema
>;
