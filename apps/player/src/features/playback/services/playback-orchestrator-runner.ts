import {
  createDrizzleSpotifyBackgroundPlaybackPorts,
  playbackSessionToNormalized,
  runBackgroundPlaybackOrchestrator,
  type RunPlaybackOrchestratorResult,
  type TickPlayerResult,
} from "@muziks/playback";

import { logPlaybackLifecycle } from "@/src/lib/playback/playback-lifecycle-log";
import { broadcastSessionSnapshotFromServer } from "@/src/lib/realtime/player-session-broadcast-server";
import { getAccessTokenForPlayer } from "@/src/lib/spotify/spotify-token-vault";

import { playerBackgroundTickSampleHook } from "./background-tick-sample-hook";

export type { RunPlaybackOrchestratorResult, TickPlayerResult };

export async function runPlaybackOrchestrator(): Promise<RunPlaybackOrchestratorResult> {
  const ports = createDrizzleSpotifyBackgroundPlaybackPorts({
    getAccessToken: getAccessTokenForPlayer,
    afterSample: playerBackgroundTickSampleHook,
    publishSessionSnapshot: async ({ playerId, session }) => {
      const progressUpdatedAt =
        session.sourceUpdatedAt?.getTime() ?? session.updatedAt.getTime();

      await broadcastSessionSnapshotFromServer(playerId, {
        playback: {
          ...playbackSessionToNormalized(session),
          positionUpdatedAt: progressUpdatedAt,
        },
        stateVersion: session.stateVersion,
        stateSource: session.stateSource as "worker_api",
        authority: session.authority as "worker",
        sourceUpdatedAt: session.sourceUpdatedAt?.toISOString() ?? null,
      });
    },
  });

  logPlaybackLifecycle("tick", "orchestrator_run_start", {});

  const result = await runBackgroundPlaybackOrchestrator(ports);

  logPlaybackLifecycle("tick", "orchestrator_run_done", {
    playersProcessed: result.playersProcessed,
    eventsEmitted: result.eventsEmitted,
    summary: result.results.map((r) => ({
      playerId: r.playerId,
      ok: r.ok,
      paused: r.paused,
      track: r.trackName,
      events: r.eventsEmitted,
    })),
  });

  return result;
}
