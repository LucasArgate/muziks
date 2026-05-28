import type { BackgroundTickSampleEffectsDeps } from "@muziks/playback";

import { publishWorkerQueueSnapshot } from "../realtime/muziks-queue-broadcast.js";
import { publishWorkerTrackEvent } from "../realtime/track-event-broadcast.js";
import { getAccessTokenForPlayer } from "../spotify/token-vault.js";

export const workerBackgroundTickSampleDeps: BackgroundTickSampleEffectsDeps =
  {
    getAccessToken: getAccessTokenForPlayer,
    publishQueueSnapshot: publishWorkerQueueSnapshot,
    publishTrackEvent: publishWorkerTrackEvent,
  };
