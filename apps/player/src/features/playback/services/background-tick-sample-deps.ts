import type { BackgroundTickSampleEffectsDeps } from "@muziks/playback";

import { logPlaybackLifecycle } from "@/src/lib/playback/playback-lifecycle-log";
import { broadcastQueueSnapshotFromServer } from "@/src/lib/realtime/muziks-queue-broadcast-server";
import { broadcastTrackEventFromServer } from "@/src/lib/realtime/player-session-broadcast-server";
import { getAccessTokenForPlayer } from "@/src/lib/spotify/spotify-token-vault";

export const playerBackgroundTickSampleDeps: BackgroundTickSampleEffectsDeps =
  {
    getAccessToken: getAccessTokenForPlayer,
    publishQueueSnapshot: broadcastQueueSnapshotFromServer,
    publishTrackEvent: async (playerId, event) => {
      await broadcastTrackEventFromServer(playerId, { event });
    },
    logLifecycle: logPlaybackLifecycle,
  };
