import type { NormalizedSpotifyPlayerState } from "@muziks/types";

import {
  hasSemanticPlaybackChange,
  playbackSessionToNormalized,
  type PlaybackSessionProjection,
} from "../domain/playback-state";

export type BackgroundPlaybackSession = PlaybackSessionProjection & {
  spotifyUserId: string | null;
  syncMode: string;
  preferredDeviceId: string | null;
  activeDeviceName: string | null;
  sdkDeviceId: string | null;
  browserInstanceId: string | null;
  browserVisibility: string;
  browserLastSeenAt: Date | null;
  stateVersion: number;
  stateSource: string;
  authority: string;
  sourceUpdatedAt: Date | null;
};

export type TickPlayerResult = {
  playerId: string;
  ok: boolean;
  skipped?: "no_token" | "spotify_error";
  retryAfterMs?: number;
  eventsEmitted: number;
  sessionUpdated: boolean;
  paused?: boolean;
  trackName?: string | null;
};

export type RunPlaybackOrchestratorResult = {
  playersProcessed: number;
  eventsEmitted: number;
  results: TickPlayerResult[];
};

export type PlaybackAccessTokenProvider = (
  playerId: string,
) => Promise<string | null>;

export type CurrentPlaybackSample = {
  state: NormalizedSpotifyPlayerState;
  activeDeviceName?: string | null;
};

export type PlaybackSessionSnapshotPublisher = (input: {
  playerId: string;
  session: BackgroundPlaybackSession;
}) => Promise<void>;

export type BackgroundPlaybackOrchestratorPorts = {
  listPlayerIdsForTick: () => Promise<string[]>;
  getAccessToken: PlaybackAccessTokenProvider;
  fetchCurrentPlayback: (accessToken: string) => Promise<CurrentPlaybackSample>;
  getPlaybackSession: (
    playerId: string,
  ) => Promise<BackgroundPlaybackSession | null>;
  upsertWorkerPlaybackSession: (input: {
    playerId: string;
    state: NormalizedSpotifyPlayerState;
    activeDeviceName?: string | null;
    existing: BackgroundPlaybackSession | null;
  }) => Promise<BackgroundPlaybackSession>;
  savePollCursor: (result: TickPlayerResult) => Promise<void>;
  publishSessionSnapshot?: PlaybackSessionSnapshotPublisher;
};

export async function tickBackgroundPlayer(
  playerId: string,
  ports: BackgroundPlaybackOrchestratorPorts,
): Promise<TickPlayerResult> {
  const accessToken = await ports.getAccessToken(playerId);

  if (!accessToken) {
    return {
      playerId,
      ok: false,
      skipped: "no_token",
      eventsEmitted: 0,
      sessionUpdated: false,
    };
  }

  let sample: CurrentPlaybackSample;
  try {
    sample = await ports.fetchCurrentPlayback(accessToken);
  } catch (error) {
    const retryAfterMs =
      error instanceof Error &&
      "retryAfterMs" in error &&
      typeof error.retryAfterMs === "number"
        ? error.retryAfterMs
        : undefined;
    return {
      playerId,
      ok: false,
      skipped: "spotify_error",
      retryAfterMs,
      eventsEmitted: 0,
      sessionUpdated: false,
    };
  }

  const existing = await ports.getPlaybackSession(playerId);
  const nextSession = await ports.upsertWorkerPlaybackSession({
    playerId,
    state: sample.state,
    activeDeviceName: sample.activeDeviceName ?? null,
    existing,
  });

  const previousState = existing ? playbackSessionToNormalized(existing) : null;
  if (hasSemanticPlaybackChange(previousState, sample.state) && ports.publishSessionSnapshot) {
    await ports.publishSessionSnapshot({
      playerId,
      session: nextSession,
    }).catch(() => {
      // Realtime fan-out is best-effort; persisted state remains authoritative.
    });
  }

  return {
    playerId,
    ok: true,
    eventsEmitted: 0,
    sessionUpdated: true,
    paused: sample.state.paused,
    trackName: sample.state.trackName,
  };
}

export async function runBackgroundPlaybackOrchestrator(
  ports: BackgroundPlaybackOrchestratorPorts,
): Promise<RunPlaybackOrchestratorResult> {
  const playerIds = await ports.listPlayerIdsForTick();
  const results: TickPlayerResult[] = [];
  let eventsEmitted = 0;

  for (const playerId of playerIds) {
    const result = await tickBackgroundPlayer(playerId, ports);
    await ports.savePollCursor(result);
    results.push(result);
    eventsEmitted += result.eventsEmitted;
  }

  return {
    playersProcessed: results.length,
    eventsEmitted,
    results,
  };
}
