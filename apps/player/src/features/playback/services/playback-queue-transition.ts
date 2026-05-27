import { dequeueNextQueueItemHandler } from "@muziks/queue";
import type { NormalizedSpotifyPlayerState } from "@muziks/types";

import { broadcastQueueSnapshotFromServer } from "@/src/lib/realtime/muziks-queue-broadcast-server";

import { mirrorNextToSpotifyQueueHandler } from "@/src/slices/playback/mirror-next-to-spotify-queue/handler";

export async function handleConfirmedTrackTransition(input: {
  playerId: string;
  previousTrackUri: string | null;
  nextState: NormalizedSpotifyPlayerState;
}): Promise<{ dequeued: boolean; mirrored: boolean }> {
  const nextUri = input.nextState.trackUri;
  if (!nextUri || nextUri === input.previousTrackUri) {
    return { dequeued: false, mirrored: false };
  }

  const idempotencyKey = [
    input.playerId,
    input.previousTrackUri ?? "none",
    nextUri,
  ].join(":");

  const dequeueResult = await dequeueNextQueueItemHandler(input.playerId, {
    reason: "track_uri_changed",
    idempotencyKey,
  });

  if (dequeueResult.status === 200) {
    await broadcastQueueSnapshotFromServer(input.playerId, {
      ...dequeueResult.body.snapshot,
      source: "dequeue",
    });
  }

  const mirrorResult = await mirrorNextToSpotifyQueueHandler(input.playerId, {
    deviceId: input.nextState.deviceId ?? undefined,
    currentTrackUri: nextUri,
    lookahead: 3,
  });

  const mirrored =
    mirrorResult.status === 200 && mirrorResult.body.mirrored === true;

  return {
    dequeued:
      dequeueResult.status === 200 &&
      dequeueResult.body.dequeued !== null,
    mirrored,
  };
}
