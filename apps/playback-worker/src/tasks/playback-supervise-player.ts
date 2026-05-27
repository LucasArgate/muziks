import { task } from "@trigger.dev/sdk";

import {
  buildScheduledSuperviseIdempotencyKey,
  resolveSuperviseDelayMs,
  superviseBackgroundPlayer,
  type SupervisePlayerSource,
} from "../lib/supervise/supervise-player.js";
import { requestSupervisePlayer } from "../lib/supervise/request-supervise.js";
import { PLAYBACK_SUPERVISE_PLAYER_TASK_ID } from "./task-ids.js";

type SupervisePlayerPayload = {
  playerId: string;
  source?: SupervisePlayerSource;
};

export const playbackSupervisePlayer = task({
  id: PLAYBACK_SUPERVISE_PLAYER_TASK_ID,
  run: async (payload: SupervisePlayerPayload) => {
    if (!payload.playerId) {
      throw new Error("playerId_required");
    }

    const result = await superviseBackgroundPlayer(payload.playerId);

    if (result.skipped || !result.nextTickAt) {
      return result;
    }

    const nextTickAt = new Date(result.nextTickAt);
    const delayMs = resolveSuperviseDelayMs(nextTickAt);

    await requestSupervisePlayer({
      playerId: payload.playerId,
      source: "schedule",
      idempotencyKey: buildScheduledSuperviseIdempotencyKey(
        payload.playerId,
        nextTickAt,
      ),
      delayMs,
      idempotencyKeyTTL: `${Math.ceil(delayMs / 1000) + 120}s`,
    });

    return { ...result, scheduledNext: true };
  },
});
