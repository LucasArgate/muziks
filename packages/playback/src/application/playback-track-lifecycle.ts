import type { NormalizedSpotifyPlayerState } from "@muziks/types";
import type {
  PlaybackTrackEvent,
  PlaybackTrackEventType,
} from "@muziks/types";

import {
  getPlaybackTrackLifecycle,
  insertPlaybackTrackEvent,
  upsertPlaybackTrackLifecycle,
  type PlaybackTrackLifecycleRow,
} from "../infrastructure/playback-track-lifecycle-repository";

const END_TOLERANCE_MS = 2_000;

export type PlaybackLifecycleLogKind =
  | "tick"
  | "event"
  | "transition"
  | "warn"
  | "skip";

export type PlaybackTrackLifecycleDeps = {
  publishTrackEvent?: (
    playerId: string,
    event: PlaybackTrackEvent,
  ) => Promise<void>;
  logLifecycle?: (
    kind: PlaybackLifecycleLogKind,
    tag: string,
    payload: Record<string, unknown>,
  ) => void;
};

export function spotifyTrackIdFromUri(uri: string | null): string | null {
  if (!uri) return null;
  const parts = uri.split(":");
  return parts[parts.length - 1] ?? uri;
}

export function computeExpectedEndAt(input: {
  positionUpdatedAt: number;
  positionMs: number;
  durationMs: number;
}): Date {
  const remaining = Math.max(0, input.durationMs - input.positionMs);
  return new Date(input.positionUpdatedAt + remaining);
}

function isAtTrackEndByPosition(state: NormalizedSpotifyPlayerState): boolean {
  if (!state.trackUri || state.durationMs <= 0) {
    return false;
  }
  return state.positionMs >= state.durationMs - END_TOLERANCE_MS;
}

function lifecycleSnapshot(
  lifecycle: PlaybackTrackLifecycleRow | null,
): Record<string, unknown> | null {
  if (!lifecycle) return null;
  return {
    phase: lifecycle.phase,
    trackUri: lifecycle.activeTrackUri,
    spotifyTrackId: lifecycle.activeSpotifyTrackId,
    positionAtStartMs: lifecycle.positionAtStartMs,
    durationMs: lifecycle.durationMs,
    expectedEndAt: lifecycle.expectedEndAt?.toISOString() ?? null,
  };
}

function stateSnapshot(
  state: NormalizedSpotifyPlayerState,
): Record<string, unknown> {
  return {
    trackUri: state.trackUri,
    trackName: state.trackName,
    paused: state.paused,
    status: state.status,
    positionMs: state.positionMs,
    durationMs: state.durationMs,
    positionUpdatedAt: state.positionUpdatedAt,
    deviceId: state.deviceId,
  };
}

async function emitEvent(
  deps: PlaybackTrackLifecycleDeps,
  input: {
    playerId: string;
    type: PlaybackTrackEventType;
    trackUri: string | null;
    spotifyTrackId: string | null;
    startedAt: Date | null;
    idempotencyStartedAt?: Date | null;
    metadata?: Record<string, unknown>;
  },
): Promise<boolean> {
  const event = await insertPlaybackTrackEvent({
    ...input,
    startedAt: input.idempotencyStartedAt ?? input.startedAt,
  });
  if (!event) {
    deps.logLifecycle?.("skip", `duplicate_${input.type}`, {
      playerId: input.playerId,
      type: input.type,
    });
    return false;
  }

  deps.logLifecycle?.("event", input.type, {
    playerId: input.playerId,
    eventId: event.id,
    trackUri: input.trackUri,
    metadata: input.metadata,
  });

  await deps.publishTrackEvent?.(input.playerId, event);
  return true;
}

async function startTrack(
  deps: PlaybackTrackLifecycleDeps,
  input: {
    playerId: string;
    state: NormalizedSpotifyPlayerState;
    previous: PlaybackTrackLifecycleRow | null;
    reason: string;
  },
): Promise<number> {
  const trackUri = input.state.trackUri;
  const spotifyTrackId = spotifyTrackIdFromUri(trackUri);
  const startedAt = new Date();
  const positionUpdatedAt = input.state.positionUpdatedAt ?? Date.now();
  const expectedEndAt = computeExpectedEndAt({
    positionUpdatedAt,
    positionMs: input.state.positionMs,
    durationMs: input.state.durationMs,
  });

  if (
    input.previous?.phase === "playing" &&
    input.previous.activeSpotifyTrackId &&
    input.previous.activeSpotifyTrackId !== spotifyTrackId &&
    input.previous.startedAt
  ) {
    await emitEvent(deps, {
      playerId: input.playerId,
      type: "track_advanced",
      trackUri: input.previous.activeTrackUri,
      spotifyTrackId: input.previous.activeSpotifyTrackId,
      startedAt: input.previous.startedAt,
      metadata: {
        nextTrackUri: trackUri,
        reason: "uri_changed",
      },
    });
  }

  await upsertPlaybackTrackLifecycle({
    playerId: input.playerId,
    activeTrackUri: trackUri,
    activeSpotifyTrackId: spotifyTrackId,
    startedAt,
    positionAtStartMs: input.state.positionMs,
    durationMs: input.state.durationMs,
    expectedEndAt,
    phase: "playing",
  });

  deps.logLifecycle?.("transition", "track_started", {
    playerId: input.playerId,
    reason: input.reason,
    expectedEndAt: expectedEndAt.toISOString(),
    from: lifecycleSnapshot(input.previous),
    spotify: stateSnapshot(input.state),
  });

  const inserted = await emitEvent(deps, {
    playerId: input.playerId,
    type: "track_started",
    trackUri,
    spotifyTrackId,
    startedAt,
    metadata: {
      reason: input.reason,
      expectedEndAt: expectedEndAt.toISOString(),
      durationMs: input.state.durationMs,
      positionMs: input.state.positionMs,
    },
  });

  return inserted ? 1 : 0;
}

async function pauseTrack(
  deps: PlaybackTrackLifecycleDeps,
  input: {
    playerId: string;
    lifecycle: PlaybackTrackLifecycleRow;
    state: NormalizedSpotifyPlayerState;
    reason: string;
  },
): Promise<number> {
  const pauseAt = new Date();
  const positionMs = input.state.positionMs;

  await upsertPlaybackTrackLifecycle({
    ...input.lifecycle,
    positionAtStartMs: positionMs,
    durationMs: input.state.durationMs,
    expectedEndAt: null,
    phase: "paused",
  });

  deps.logLifecycle?.("transition", "track_paused", {
    playerId: input.playerId,
    reason: input.reason,
    positionMs,
    from: lifecycleSnapshot(input.lifecycle),
    spotify: stateSnapshot(input.state),
  });

  const inserted = await emitEvent(deps, {
    playerId: input.playerId,
    type: "track_paused",
    trackUri: input.lifecycle.activeTrackUri,
    spotifyTrackId: input.lifecycle.activeSpotifyTrackId,
    startedAt: pauseAt,
    idempotencyStartedAt: pauseAt,
    metadata: {
      reason: input.reason,
      positionMs,
      trackStartedAt: input.lifecycle.startedAt?.toISOString() ?? null,
    },
  });

  return inserted ? 1 : 0;
}

async function resumeTrack(
  deps: PlaybackTrackLifecycleDeps,
  input: {
    playerId: string;
    lifecycle: PlaybackTrackLifecycleRow;
    state: NormalizedSpotifyPlayerState;
    reason: string;
  },
): Promise<number> {
  const resumeAt = new Date();
  const positionUpdatedAt = input.state.positionUpdatedAt ?? Date.now();
  const expectedEndAt = computeExpectedEndAt({
    positionUpdatedAt,
    positionMs: input.state.positionMs,
    durationMs: input.state.durationMs,
  });

  await upsertPlaybackTrackLifecycle({
    ...input.lifecycle,
    positionAtStartMs: input.state.positionMs,
    durationMs: input.state.durationMs,
    expectedEndAt,
    phase: "playing",
  });

  deps.logLifecycle?.("transition", "track_resumed", {
    playerId: input.playerId,
    reason: input.reason,
    expectedEndAt: expectedEndAt.toISOString(),
    from: lifecycleSnapshot(input.lifecycle),
    spotify: stateSnapshot(input.state),
  });

  const inserted = await emitEvent(deps, {
    playerId: input.playerId,
    type: "track_resumed",
    trackUri: input.lifecycle.activeTrackUri,
    spotifyTrackId: input.lifecycle.activeSpotifyTrackId,
    startedAt: resumeAt,
    idempotencyStartedAt: resumeAt,
    metadata: {
      reason: input.reason,
      expectedEndAt: expectedEndAt.toISOString(),
      positionMs: input.state.positionMs,
      trackStartedAt: input.lifecycle.startedAt?.toISOString() ?? null,
    },
  });

  return inserted ? 1 : 0;
}

async function endTrack(
  deps: PlaybackTrackLifecycleDeps,
  input: {
    playerId: string;
    lifecycle: PlaybackTrackLifecycleRow;
    reason: string;
    state: NormalizedSpotifyPlayerState;
  },
): Promise<number> {
  deps.logLifecycle?.("transition", "track_ended", {
    playerId: input.playerId,
    reason: input.reason,
    from: lifecycleSnapshot(input.lifecycle),
    spotify: stateSnapshot(input.state),
  });

  const inserted = await emitEvent(deps, {
    playerId: input.playerId,
    type: "track_ended",
    trackUri: input.lifecycle.activeTrackUri,
    spotifyTrackId: input.lifecycle.activeSpotifyTrackId,
    startedAt: input.lifecycle.startedAt,
    metadata: {
      reason: input.reason,
      expectedEndAt: input.lifecycle.expectedEndAt?.toISOString() ?? null,
      positionMs: input.state.positionMs,
    },
  });

  await upsertPlaybackTrackLifecycle({
    playerId: input.playerId,
    activeTrackUri: null,
    activeSpotifyTrackId: null,
    startedAt: null,
    positionAtStartMs: 0,
    durationMs: 0,
    expectedEndAt: null,
    phase: "ended",
  });

  return inserted ? 1 : 0;
}

async function markIdle(
  deps: PlaybackTrackLifecycleDeps,
  playerId: string,
): Promise<number> {
  const lifecycle = await getPlaybackTrackLifecycle(playerId);
  if (lifecycle?.phase === "idle" && !lifecycle.activeTrackUri) {
    return 0;
  }

  if (
    lifecycle &&
    (lifecycle.phase === "playing" || lifecycle.phase === "paused") &&
    lifecycle.startedAt
  ) {
    await emitEvent(deps, {
      playerId,
      type: "track_advanced",
      trackUri: lifecycle.activeTrackUri,
      spotifyTrackId: lifecycle.activeSpotifyTrackId,
      startedAt: lifecycle.startedAt,
      metadata: { reason: "playback_idle" },
    });
  }

  deps.logLifecycle?.("transition", "track_idle", {
    playerId,
    from: lifecycleSnapshot(lifecycle),
  });

  await upsertPlaybackTrackLifecycle({
    playerId,
    activeTrackUri: null,
    activeSpotifyTrackId: null,
    startedAt: null,
    positionAtStartMs: 0,
    durationMs: 0,
    expectedEndAt: null,
    phase: "idle",
  });

  const inserted = await emitEvent(deps, {
    playerId,
    type: "track_idle",
    trackUri: null,
    spotifyTrackId: null,
    startedAt: new Date(),
    idempotencyStartedAt: new Date(),
    metadata: { reason: "no_playback" },
  });

  return inserted ? 1 : 0;
}

function shouldStartFresh(
  lifecycle: PlaybackTrackLifecycleRow | null,
  spotifyTrackId: string,
  trackChanged: boolean,
): boolean {
  if (!lifecycle || trackChanged) return true;
  if (lifecycle.phase === "idle" || lifecycle.phase === "ended") return true;
  if (
    lifecycle.activeSpotifyTrackId !== spotifyTrackId &&
    lifecycle.phase !== "paused"
  ) {
    return true;
  }
  return false;
}

export type ApplyLifecycleResult = {
  eventsEmitted: number;
  action: string;
};

export async function applyLifecycleFromSample(
  playerId: string,
  state: NormalizedSpotifyPlayerState,
  deps: PlaybackTrackLifecycleDeps = {},
): Promise<ApplyLifecycleResult> {
  let eventsEmitted = 0;
  let action = "noop";
  const lifecycle = await getPlaybackTrackLifecycle(playerId);
  const trackUri = state.trackUri;
  const spotifyTrackId = spotifyTrackIdFromUri(trackUri);

  if (!trackUri || !spotifyTrackId) {
    eventsEmitted += await markIdle(deps, playerId);
    action = "idle";
    return { eventsEmitted, action };
  }

  const previousTrackId = lifecycle?.activeSpotifyTrackId ?? null;
  const trackChanged =
    previousTrackId !== null && previousTrackId !== spotifyTrackId;

  if (shouldStartFresh(lifecycle, spotifyTrackId, trackChanged)) {
    eventsEmitted += await startTrack(deps, {
      playerId,
      state,
      previous: lifecycle,
      reason: trackChanged ? "track_changed" : "new_playback",
    });
    action = trackChanged ? "started_after_change" : "started";
    return { eventsEmitted, action };
  }

  if (!lifecycle) {
    return { eventsEmitted, action };
  }

  if (lifecycle.phase === "playing" && state.paused) {
    eventsEmitted += await pauseTrack(deps, {
      playerId,
      lifecycle,
      state,
      reason: "spotify_paused",
    });
    action = "paused";
    return { eventsEmitted, action };
  }

  if (lifecycle.phase === "paused") {
    if (state.paused) {
      action = "still_paused";
      deps.logLifecycle?.("tick", "still_paused", {
        playerId,
        lifecycle: lifecycleSnapshot(lifecycle),
        spotify: stateSnapshot(state),
      });
      return { eventsEmitted, action };
    }

    eventsEmitted += await resumeTrack(deps, {
      playerId,
      lifecycle,
      state,
      reason: "spotify_resumed",
    });
    action = "resumed";
  }

  const activeLifecycle =
    (await getPlaybackTrackLifecycle(playerId)) ?? lifecycle;

  if (activeLifecycle.phase !== "playing") {
    return { eventsEmitted, action };
  }

  const expectedPassed =
    activeLifecycle.expectedEndAt !== null &&
    Date.now() >= activeLifecycle.expectedEndAt.getTime() - END_TOLERANCE_MS;

  const atEnd = isAtTrackEndByPosition(state);
  const playingThrough = !state.paused;

  if (expectedPassed && playingThrough && atEnd) {
    eventsEmitted += await endTrack(deps, {
      playerId,
      lifecycle: activeLifecycle,
      reason: "expected_end_reached",
      state,
    });
    action = "ended";
  } else if (expectedPassed && playingThrough && !atEnd) {
    deps.logLifecycle?.("tick", "awaiting_end_position", {
      playerId,
      expectedEndAt: activeLifecycle.expectedEndAt?.toISOString(),
      positionMs: state.positionMs,
      durationMs: state.durationMs,
    });
    action = "awaiting_end";
  } else {
    action = action === "noop" ? "playing" : action;
  }

  return { eventsEmitted, action };
}
