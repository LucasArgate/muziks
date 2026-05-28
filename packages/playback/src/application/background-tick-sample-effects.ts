import type { QueueSnapshotBroadcast } from "@muziks/types";
import type { PlaybackTrackEvent } from "@muziks/types";

import type {
  BackgroundTickSampleContext,
  BackgroundTickSampleHook,
  PlaybackAccessTokenProvider,
} from "./background-playback-orchestrator";
import { handleConfirmedTrackTransition } from "./confirmed-track-transition";
import { mirrorNextToSpotifyQueueForPlayer } from "./mirror-next-to-spotify-queue";
import {
  applyLifecycleFromSample,
  type PlaybackTrackLifecycleDeps,
} from "./playback-track-lifecycle";
import { getPlaybackTrackLifecycle } from "../infrastructure/playback-track-lifecycle-repository";

export const PRELOAD_MS = 10_000;

export type BackgroundTickSampleEffectsDeps = {
  getAccessToken: PlaybackAccessTokenProvider;
  publishQueueSnapshot: (
    playerId: string,
    snapshot: QueueSnapshotBroadcast,
  ) => Promise<void>;
  publishTrackEvent?: (
    playerId: string,
    event: PlaybackTrackEvent,
  ) => Promise<void>;
  logLifecycle?: PlaybackTrackLifecycleDeps["logLifecycle"];
};

function lifecycleDeps(
  deps: BackgroundTickSampleEffectsDeps,
): PlaybackTrackLifecycleDeps {
  return {
    publishTrackEvent: deps.publishTrackEvent,
    logLifecycle: deps.logLifecycle,
  };
}

export async function runBackgroundTickSampleEffects(
  context: BackgroundTickSampleContext,
  deps: BackgroundTickSampleEffectsDeps,
): Promise<{ eventsEmitted: number }> {
  const { playerId, state, previousState } = context;

  const lifecycle = await applyLifecycleFromSample(
    playerId,
    state,
    lifecycleDeps(deps),
  );

  if (
    previousState?.trackUri &&
    state.trackUri &&
    previousState.trackUri !== state.trackUri
  ) {
    await handleConfirmedTrackTransition(
      {
        playerId,
        previousTrackUri: previousState.trackUri,
        nextState: state,
      },
      {
        getAccessToken: deps.getAccessToken,
        publishQueueSnapshot: deps.publishQueueSnapshot,
      },
    ).catch(() => {
      // queue transition is best-effort during background tick
    });
  }

  const activeLifecycle = await getPlaybackTrackLifecycle(playerId);
  if (
    activeLifecycle?.expectedEndAt &&
    !state.paused &&
    state.trackUri &&
    activeLifecycle.expectedEndAt.getTime() - Date.now() <= PRELOAD_MS
  ) {
    await mirrorNextToSpotifyQueueForPlayer(
      playerId,
      {
        deviceId: state.deviceId ?? undefined,
        currentTrackUri: state.trackUri,
        lookahead: 3,
      },
      deps.getAccessToken,
    ).catch(() => {
      // near-end mirror is best-effort on tick
    });
  }

  return { eventsEmitted: lifecycle.eventsEmitted };
}

export function createBackgroundTickSampleHook(
  deps: BackgroundTickSampleEffectsDeps,
): BackgroundTickSampleHook {
  return async (context) => runBackgroundTickSampleEffects(context, deps);
}
