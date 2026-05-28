import { listQueueItemsForPlayer, toQueueItemDto } from "@muziks/db";
import { pickMuziksLookaheadUris } from "@muziks/queue";
import {
  addToQueue,
  getPlaybackQueue,
  normalizeSpotifyPlaybackQueue,
} from "@muziks/spotify";
import {
  mirrorNextToSpotifyQueueInputSchema,
  mirrorNextToSpotifyQueueResultSchema,
} from "@muziks/types";

import type { PlaybackAccessTokenProvider } from "./background-playback-orchestrator";

const DEFAULT_LOOKAHEAD = 3;

export async function mirrorNextToSpotifyQueueForPlayer(
  playerId: string,
  rawBody: unknown,
  getAccessToken: PlaybackAccessTokenProvider,
) {
  const parsed = mirrorNextToSpotifyQueueInputSchema.safeParse(rawBody ?? {});
  if (!parsed.success) {
    return {
      status: 400 as const,
      body: { error: "invalid_body", details: parsed.error.flatten() },
    };
  }

  const accessToken = await getAccessToken(playerId);
  if (!accessToken) {
    return {
      status: 401 as const,
      body: mirrorNextToSpotifyQueueResultSchema.parse({
        mirrored: false,
        reason: "no_token",
        queuedUris: [],
        skippedUris: [],
      }),
    };
  }

  const rows = await listQueueItemsForPlayer(playerId);
  const items = rows.map(toQueueItemDto);
  const lookahead = parsed.data.lookahead ?? DEFAULT_LOOKAHEAD;
  const targetUris = pickMuziksLookaheadUris(
    items,
    parsed.data.currentTrackUri ?? null,
    lookahead,
  );

  if (targetUris.length === 0) {
    return {
      status: 200 as const,
      body: mirrorNextToSpotifyQueueResultSchema.parse({
        mirrored: false,
        reason: "empty_queue",
        queuedUris: [],
        skippedUris: [],
      }),
    };
  }

  let upcomingUris = new Set<string>();
  try {
    const rawQueue = await getPlaybackQueue({ accessToken });
    const normalized = normalizeSpotifyPlaybackQueue(rawQueue);
    upcomingUris = new Set(
      normalized.upcoming.map((track) => track.uri).filter(Boolean) as string[],
    );
    if (normalized.currentlyPlaying?.uri) {
      upcomingUris.add(normalized.currentlyPlaying.uri);
    }
  } catch {
    return {
      status: 502 as const,
      body: mirrorNextToSpotifyQueueResultSchema.parse({
        mirrored: false,
        reason: "spotify_error",
        queuedUris: [],
        skippedUris: targetUris,
      }),
    };
  }

  const queuedUris: string[] = [];
  const skippedUris: string[] = [];
  const deviceId = parsed.data.deviceId;

  for (const uri of targetUris) {
    if (upcomingUris.has(uri)) {
      skippedUris.push(uri);
      continue;
    }

    try {
      await addToQueue({ accessToken, uri, deviceId });
      queuedUris.push(uri);
      upcomingUris.add(uri);
    } catch {
      return {
        status: 502 as const,
        body: mirrorNextToSpotifyQueueResultSchema.parse({
          mirrored: queuedUris.length > 0,
          reason: "spotify_error",
          queuedUris,
          skippedUris: [
            ...skippedUris,
            uri,
            ...targetUris.slice(targetUris.indexOf(uri) + 1),
          ],
        }),
      };
    }
  }

  return {
    status: 200 as const,
    body: mirrorNextToSpotifyQueueResultSchema.parse({
      mirrored: queuedUris.length > 0,
      reason: queuedUris.length > 0 ? "mirrored" : "already_queued",
      queuedUris,
      skippedUris,
    }),
  };
}
