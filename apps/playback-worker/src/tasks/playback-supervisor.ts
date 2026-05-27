import { schedules } from "@trigger.dev/sdk";

import { createDrizzleSpotifyBackgroundPlaybackPorts } from "@muziks/playback";

import { publishWorkerSessionSnapshot } from "../lib/realtime/session-broadcast.js";
import { getAccessTokenForPlayer } from "../lib/spotify/token-vault.js";
import { buildSupervisorWakeIdempotencyKey } from "../lib/supervise/supervise-player.js";
import { requestSupervisePlayer } from "../lib/supervise/request-supervise.js";
import { getPlaybackWorkerConfig } from "../config.js";

export const playbackSupervisor = schedules.task({
  id: "playback-supervisor",
  cron: getPlaybackWorkerConfig().playbackSupervisorCron,
  run: async (payload) => {
    const ports = createDrizzleSpotifyBackgroundPlaybackPorts({
      getAccessToken: getAccessTokenForPlayer,
      publishSessionSnapshot: publishWorkerSessionSnapshot,
    });

    const playerIds = await ports.listPlayerIdsForTick();
    let superviseTriggers = 0;

    for (const playerId of playerIds) {
      await requestSupervisePlayer({
        playerId,
        source: "supervisor",
        idempotencyKey: buildSupervisorWakeIdempotencyKey(playerId),
        idempotencyKeyTTL: "12m",
      });
      superviseTriggers += 1;
    }

    return {
      scheduledAt: payload.timestamp.toISOString(),
      playersDue: playerIds.length,
      superviseTriggers,
    };
  },
});
