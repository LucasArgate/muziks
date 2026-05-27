import { schedules, task } from "@trigger.dev/sdk";

import { runPostgresSuperviseBridge } from "../lib/realtime/postgres-supervise-bridge.js";
import { getPlaybackWorkerConfig } from "../config.js";
import {
  PLAYBACK_REALTIME_LISTENER_TASK_ID,
  PLAYBACK_REALTIME_WATCHER_TASK_ID,
} from "./task-ids.js";

export const playbackRealtimeListener = task({
  id: PLAYBACK_REALTIME_LISTENER_TASK_ID,
  run: async () => {
    const { durationMs, chainDelayMs } = getPlaybackWorkerConfig().realtimeWatcher;
    const bridge = await runPostgresSuperviseBridge({ durationMs });

    const chainBucket = Math.floor(Date.now() / 60_000);
    await playbackRealtimeListener.trigger(undefined, {
      delay: new Date(Date.now() + chainDelayMs),
      idempotencyKey: `realtime-listener:chain:${chainBucket}`,
      idempotencyKeyTTL: "90s",
    });

    return {
      durationMs,
      wakesRequested: bridge.wakesRequested,
    };
  },
});

/** Cron de segurança: (re)inicia a cadeia do listener postgres_changes. */
export const playbackRealtimeWatcher = schedules.task({
  id: PLAYBACK_REALTIME_WATCHER_TASK_ID,
  cron: getPlaybackWorkerConfig().playbackRealtimeWatcherCron,
  run: async (payload) => {
    await playbackRealtimeListener.trigger(undefined, {
      idempotencyKey: "realtime-listener:bootstrap",
      idempotencyKeyTTL: "4m",
    });

    return {
      scheduledAt: payload.timestamp.toISOString(),
      listenerBootstrapped: true,
    };
  },
});
