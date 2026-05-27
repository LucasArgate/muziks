import { tasks } from "@trigger.dev/sdk";

import { PLAYBACK_SUPERVISE_PLAYER_TASK_ID } from "../../tasks/task-ids.js";
import type { SupervisePlayerSource } from "./supervise-player.js";

type TriggerSuperviseOptions = {
  playerId: string;
  source: SupervisePlayerSource;
  idempotencyKey: string;
  delayMs?: number;
  idempotencyKeyTTL?: string;
};

export async function requestSupervisePlayer(
  options: TriggerSuperviseOptions,
): Promise<void> {
  const delay =
    options.delayMs !== undefined && options.delayMs > 0
      ? new Date(Date.now() + options.delayMs)
      : undefined;

  await tasks.trigger(
    PLAYBACK_SUPERVISE_PLAYER_TASK_ID,
    {
      playerId: options.playerId,
      source: options.source,
    },
    {
      idempotencyKey: options.idempotencyKey,
      ...(options.idempotencyKeyTTL
        ? { idempotencyKeyTTL: options.idempotencyKeyTTL }
        : {}),
      ...(delay ? { delay } : {}),
    },
  );
}
