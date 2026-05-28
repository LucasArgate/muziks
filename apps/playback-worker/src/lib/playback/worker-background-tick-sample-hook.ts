import { createBackgroundTickSampleHook } from "@muziks/playback";

import { workerBackgroundTickSampleDeps } from "./worker-background-tick-sample-deps.js";

export const workerBackgroundTickSampleHook = createBackgroundTickSampleHook(
  workerBackgroundTickSampleDeps,
);
