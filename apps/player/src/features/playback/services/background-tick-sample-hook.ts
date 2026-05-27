import type { BackgroundTickSampleHook } from "@muziks/playback";

import { getPlaybackTrackLifecycle } from "@/src/lib/playback/playback-track-lifecycle-repository";

import { PRELOAD_MS } from "./near-end-scheduler";
import { handleConfirmedTrackTransition } from "./playback-queue-transition";
import { applyLifecycleFromSample } from "./playback-track-lifecycle";

/** Lifecycle, dequeue e mirror — após persistência em `@muziks/playback`. */
export const playerBackgroundTickSampleHook: BackgroundTickSampleHook = async (
  context,
) => {
  const { playerId, state, previousState } = context;

  const lifecycle = await applyLifecycleFromSample(playerId, state);

  if (
    previousState?.trackUri &&
    state.trackUri &&
    previousState.trackUri !== state.trackUri
  ) {
    await handleConfirmedTrackTransition({
      playerId,
      previousTrackUri: previousState.trackUri,
      nextState: state,
    }).catch(() => {
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
    const { mirrorNextToSpotifyQueueHandler } = await import(
      "@/src/slices/playback/mirror-next-to-spotify-queue/handler"
    );
    await mirrorNextToSpotifyQueueHandler(playerId, {
      deviceId: state.deviceId ?? undefined,
      currentTrackUri: state.trackUri,
      lookahead: 3,
    }).catch(() => {
      // near-end mirror is best-effort on tick
    });
  }

  return { eventsEmitted: lifecycle.eventsEmitted };
};
