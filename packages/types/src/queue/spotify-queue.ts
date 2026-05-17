import { z } from "zod";

/**
 * Spotify `GET /me/player/queue` returns only a short lookahead (often ~2 tracks
 * after the current one). This is a provider limitation, not Muziks.
 */
export const normalizedSpotifyQueueTrackSchema = z.object({
  uri: z.string(),
  name: z.string(),
  artistName: z.string(),
  albumImageUrl: z.string().nullable(),
  durationMs: z.number().int().nonnegative(),
});

export type NormalizedSpotifyQueueTrack = z.infer<
  typeof normalizedSpotifyQueueTrackSchema
>;

export const normalizedSpotifyPlaybackQueueSchema = z.object({
  currentlyPlaying: normalizedSpotifyQueueTrackSchema.nullable(),
  upcoming: z.array(normalizedSpotifyQueueTrackSchema),
});

export type NormalizedSpotifyPlaybackQueue = z.infer<
  typeof normalizedSpotifyPlaybackQueueSchema
>;
