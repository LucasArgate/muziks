import { dequeueNextQueueItemHandler } from "@muziks/queue";
import type {
  NormalizedSpotifyPlayerState,
  QueueSnapshotBroadcast,
} from "@muziks/types";

import type { PlaybackAccessTokenProvider } from "./background-playback-orchestrator";
import { mirrorNextToSpotifyQueueForPlayer } from "./mirror-next-to-spotify-queue";

export type ConfirmedTrackTransitionDeps = {
  getAccessToken: PlaybackAccessTokenProvider;
  publishQueueSnapshot: (
    playerId: string,
    snapshot: QueueSnapshotBroadcast,
  ) => Promise<void>;
};

export async function handleConfirmedTrackTransition(
  input: {
    playerId: string;
    previousTrackUri: string | null;
    nextState: NormalizedSpotifyPlayerState;
  },
  deps: ConfirmedTrackTransitionDeps,
): Promise<{ dequeued: boolean; mirrored: boolean }> {
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
    await deps.publishQueueSnapshot(input.playerId, {
      ...dequeueResult.body.snapshot,
      source: "dequeue",
    });
  }

  const mirrorResult = await mirrorNextToSpotifyQueueForPlayer(
    input.playerId,
    {
      deviceId: input.nextState.deviceId ?? undefined,
      currentTrackUri: nextUri,
      lookahead: 3,
    },
    deps.getAccessToken,
  );

  const mirrored =
    mirrorResult.status === 200 && mirrorResult.body.mirrored === true;

  return {
    dequeued:
      dequeueResult.status === 200 && dequeueResult.body.dequeued !== null,
    mirrored,
  };
}
