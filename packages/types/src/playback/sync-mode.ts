import { z } from "zod";

export const playbackSyncModeSchema = z.enum(["api_device", "sdk", "hybrid"]);

export type PlaybackSyncMode = z.infer<typeof playbackSyncModeSchema>;
