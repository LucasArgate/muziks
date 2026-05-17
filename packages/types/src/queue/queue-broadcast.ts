import { z } from "zod";

import { muziksQueueSnapshotSchema } from "./muziks-queue";

export const queueSnapshotSources = [
  "dequeue",
  "vote",
  "reorder",
  "seed",
] as const;

export const queueSnapshotSourceSchema = z.enum(queueSnapshotSources);

export type QueueSnapshotSource = z.infer<typeof queueSnapshotSourceSchema>;

export const queueSnapshotBroadcastSchema = muziksQueueSnapshotSchema.extend({
  source: queueSnapshotSourceSchema,
});

export type QueueSnapshotBroadcast = z.infer<
  typeof queueSnapshotBroadcastSchema
>;

export const QUEUE_SNAPSHOT_BROADCAST_EVENT = "queue.snapshot" as const;
