import { createBackgroundTickSampleHook } from "@muziks/playback";

import { playerBackgroundTickSampleDeps } from "./background-tick-sample-deps";

/** Lifecycle, dequeue e mirror — após persistência em `@muziks/playback`. */
export const playerBackgroundTickSampleHook = createBackgroundTickSampleHook(
  playerBackgroundTickSampleDeps,
);
