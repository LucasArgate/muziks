import { getCurrentPlayback, normalizeApiPlaybackState } from "@muziks/spotify";
import type {
  NormalizedSpotifyPlayerState,
  PublishPlaybackSessionInput,
} from "@muziks/types";

import { logPlaybackLifecycle } from "@/src/lib/playback/playback-lifecycle-log";
import {
  getPlaybackSessionByPlayerId,
  playbackSessionToNormalized,
  upsertPlaybackSession,
} from "@/src/lib/playback/playback-session-repository";
import { broadcastSessionSnapshotFromServer } from "@/src/lib/realtime/player-session-broadcast-server";
import { getAccessTokenForPlayer } from "@/src/lib/spotify/spotify-token-vault";

import { applyLifecycleFromSample } from "./playback-track-lifecycle";

function fingerprint(state: NormalizedSpotifyPlayerState): string {
  return [
    state.trackUri ?? "",
    state.paused ? "1" : "0",
    state.status ?? "",
    state.deviceId ?? "",
    Math.floor(state.positionMs / 5000),
  ].join("|");
}

export type TickPlayerResult = {
  playerId: string;
  ok: boolean;
  skipped?: "no_token" | "spotify_error";
  eventsEmitted: number;
  sessionUpdated: boolean;
  lifecycleAction?: string;
  paused?: boolean;
  trackName?: string | null;
};

export async function tickPlayer(playerId: string): Promise<TickPlayerResult> {
  const accessToken = await getAccessTokenForPlayer(playerId);
  if (!accessToken) {
    logPlaybackLifecycle("skip", "no_token", { playerId });
    return {
      playerId,
      ok: false,
      skipped: "no_token",
      eventsEmitted: 0,
      sessionUpdated: false,
    };
  }

  let raw;
  try {
    raw = await getCurrentPlayback({ accessToken });
  } catch (error) {
    const message = error instanceof Error ? error.message : "spotify_error";
    logPlaybackLifecycle("warn", "spotify_api_error", { playerId, message });
    return {
      playerId,
      ok: false,
      skipped: "spotify_error",
      eventsEmitted: 0,
      sessionUpdated: false,
    };
  }

  const state = normalizeApiPlaybackState(raw);
  const existing = await getPlaybackSessionByPlayerId(playerId);
  const prevNormalized = existing
    ? playbackSessionToNormalized(existing)
    : null;
  const prevPaused = prevNormalized?.paused;

  const resolvedStatus =
    state.status ?? (state.paused ? "paused" : state.trackUri ? "playing" : "idle");

  const body: PublishPlaybackSessionInput = {
    trackUri: state.trackUri,
    trackName: state.trackName,
    artistName: state.artistName,
    albumImageUrl: state.albumImageUrl ?? null,
    positionMs: state.positionMs,
    positionUpdatedAt: state.positionUpdatedAt,
    durationMs: state.durationMs,
    paused: state.paused,
    deviceId: state.deviceId,
    status: resolvedStatus,
    lastError: state.lastError ?? null,
    syncMode: existing?.syncMode ?? "api_device",
    preferredDeviceId: existing?.preferredDeviceId ?? null,
    activeDeviceName: raw?.device?.name ?? existing?.activeDeviceName ?? null,
    stateSource: "worker_api",
    authority: "worker",
    sourceUpdatedAt: new Date().toISOString(),
  };

  const { session, accepted } = await upsertPlaybackSession(playerId, body);
  const sessionUpdated = accepted;

  const lifecycle = await applyLifecycleFromSample(playerId, state);

  const nextFp = fingerprint(state);
  const prevFp = prevNormalized ? fingerprint(prevNormalized) : null;
  const pauseFlipped =
    prevPaused !== undefined && prevPaused !== state.paused;

  if (sessionUpdated && (nextFp !== prevFp || pauseFlipped)) {
    await broadcastSessionSnapshotFromServer(playerId, {
      playback: {
        trackUri: session.currentTrackUri,
        trackName: session.trackName,
        artistName: session.artistName,
        albumImageUrl: session.albumImageUrl,
        positionMs: session.progressMs,
        positionUpdatedAt: Date.parse(session.updatedAt),
        durationMs: session.durationMs,
        paused: session.paused,
        deviceId: session.activeDeviceId,
        status: session.status,
        lastError: session.lastError,
      },
      stateVersion: session.stateVersion,
      stateSource: session.stateSource,
      authority: session.authority,
      sourceUpdatedAt: session.sourceUpdatedAt,
    });
  }

  logPlaybackLifecycle("tick", "orchestrator_tick", {
    playerId,
    lifecycleAction: lifecycle.action,
    eventsEmitted: lifecycle.eventsEmitted,
    sessionUpdated,
    pauseFlipped,
    paused: state.paused,
    status: resolvedStatus,
    track: state.trackName,
    positionMs: state.positionMs,
    durationMs: state.durationMs,
    device: raw?.device?.name ?? null,
  });

  return {
    playerId,
    ok: true,
    eventsEmitted: lifecycle.eventsEmitted,
    sessionUpdated,
    lifecycleAction: lifecycle.action,
    paused: state.paused,
    trackName: state.trackName,
  };
}
