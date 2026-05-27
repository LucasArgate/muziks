import { z } from "zod";

import { playbackStateSourceSchema } from "../playback/session";
import { normalizedSpotifyPlaybackQueueSchema } from "./spotify-queue";

export const spotifyQueueSnapshotSources = [
  "sdk_browser",
  "worker_api",
  "browser_api",
] as const;

export const spotifyQueueSnapshotSourceSchema = z.enum(
  spotifyQueueSnapshotSources,
);

export type SpotifyQueueSnapshotSource = z.infer<
  typeof spotifyQueueSnapshotSourceSchema
>;

export const spotifyQueueSnapshotBroadcastSchema = z.object({
  queue: normalizedSpotifyPlaybackQueueSchema,
  queueVersion: z.number().int().nonnegative(),
  stateVersion: z.number().int().nonnegative().optional(),
  source: spotifyQueueSnapshotSourceSchema,
});

export type SpotifyQueueSnapshotBroadcast = z.infer<
  typeof spotifyQueueSnapshotBroadcastSchema
>;

export const SPOTIFY_QUEUE_SNAPSHOT_BROADCAST_EVENT =
  "spotify.queue.snapshot" as const;
