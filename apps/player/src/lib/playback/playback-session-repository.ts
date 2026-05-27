import { getDb, playerSessions } from "@muziks/db";
import type {
  NormalizedSpotifyPlayerState,
  PlaybackSession,
  PlaybackSessionStatus,
  PlaybackSyncMode,
  PublishPlaybackSessionInput,
} from "@muziks/types";
import { sendAgentDebugLog } from "@muziks/utils";
import { eq } from "drizzle-orm";

function logPlaybackRepositoryCurrentDebug(
  hypothesisId: string,
  message: string,
  data: Record<string, unknown>,
) {
  sendAgentDebugLog({
    hypothesisId,
    location: "apps/player/src/lib/playback/playback-session-repository.ts",
    message,
    data,
  });
}

function rowToPlaybackSession(
  row: typeof playerSessions.$inferSelect,
): PlaybackSession {
  return {
    playerId: row.playerId,
    spotifyUserId: row.spotifyUserId,
    activeDeviceId: row.activeDeviceId,
    currentTrackUri: row.currentTrackUri,
    trackName: row.trackName,
    artistName: row.artistName,
    albumImageUrl: row.albumImageUrl,
    progressMs: row.progressMs,
    durationMs: row.durationMs,
    paused: row.paused,
    status: row.status as PlaybackSessionStatus,
    lastError: row.lastError,
    syncMode: (row.syncMode ?? "api_device") as PlaybackSyncMode,
    preferredDeviceId: row.preferredDeviceId,
    activeDeviceName: row.activeDeviceName,
    stateSource: (row.stateSource ?? "unknown") as PlaybackSession["stateSource"],
    authority: (row.authority ?? "unknown") as PlaybackSession["authority"],
    sdkDeviceId: row.sdkDeviceId,
    browserInstanceId: row.browserInstanceId,
    browserVisibility: (row.browserVisibility ??
      "unknown") as PlaybackSession["browserVisibility"],
    browserLastSeenAt: row.browserLastSeenAt?.toISOString() ?? null,
    sourceUpdatedAt: row.sourceUpdatedAt?.toISOString() ?? null,
    stateVersion: row.stateVersion ?? 0,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function optionalIsoToDate(value: string | null | undefined): Date | null {
  return value ? new Date(value) : null;
}

function optionalIsoToTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

function isNewerSemanticPlaybackInput(
  existing: PlaybackSession,
  input: PublishPlaybackSessionInput,
): boolean {
  const inputSourceTime = optionalIsoToTime(input.sourceUpdatedAt);
  const existingSourceTime =
    optionalIsoToTime(existing.sourceUpdatedAt) ??
    optionalIsoToTime(existing.updatedAt);

  if (
    inputSourceTime === null ||
    existingSourceTime === null ||
    inputSourceTime <= existingSourceTime
  ) {
    return false;
  }

  return (
    input.trackUri !== existing.currentTrackUri ||
    input.deviceId !== existing.activeDeviceId ||
    input.paused !== existing.paused ||
    input.status !== existing.status
  );
}

function resolvePersistedProgressMs(input: PublishPlaybackSessionInput): number {
  const durationMs = Math.max(0, input.durationMs);
  if (durationMs <= 0) {
    return Math.max(0, input.positionMs);
  }
  return Math.min(Math.max(0, input.positionMs), durationMs);
}

function resolveProgressAnchorIso(
  input: PublishPlaybackSessionInput,
  fallback: Date,
): Date {
  if (input.positionUpdatedAt !== undefined) {
    return new Date(input.positionUpdatedAt);
  }
  if (input.sourceUpdatedAt) {
    const parsed = Date.parse(input.sourceUpdatedAt);
    if (Number.isFinite(parsed)) {
      return new Date(parsed);
    }
  }
  return fallback;
}

export function playbackSessionToNormalized(
  session: PlaybackSession,
): NormalizedSpotifyPlayerState {
  const progressUpdatedAt = session.sourceUpdatedAt
    ? Date.parse(session.sourceUpdatedAt)
    : Date.parse(session.updatedAt);

  return {
    trackUri: session.currentTrackUri,
    trackName: session.trackName,
    artistName: session.artistName,
    albumImageUrl: session.albumImageUrl,
    positionMs: session.progressMs,
    positionUpdatedAt: Number.isFinite(progressUpdatedAt)
      ? progressUpdatedAt
      : Date.parse(session.updatedAt),
    durationMs: session.durationMs,
    paused: session.paused,
    deviceId: session.activeDeviceId,
    status: session.status,
    lastError: session.lastError,
  };
}

export async function getPlaybackSessionByPlayerId(
  playerId: string,
): Promise<PlaybackSession | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(playerSessions)
    .where(eq(playerSessions.playerId, playerId))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return rowToPlaybackSession(row);
}

export async function upsertConnectedSession(input: {
  playerId: string;
  spotifyUserId: string;
}): Promise<void> {
  const db = getDb();
  await db
    .insert(playerSessions)
    .values({
      playerId: input.playerId,
      spotifyUserId: input.spotifyUserId,
      status: "connected",
      syncMode: "api_device",
      stateSource: "unknown",
      authority: "unknown",
      browserVisibility: "unknown",
      paused: true,
      progressMs: 0,
      durationMs: 0,
      stateVersion: 0,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: playerSessions.playerId,
      set: {
        spotifyUserId: input.spotifyUserId,
        status: "connected",
        lastError: null,
        updatedAt: new Date(),
      },
    });
}

export type UpsertPlaybackSessionResult = {
  session: PlaybackSession;
  accepted: boolean;
};

export async function upsertPlaybackSession(
  playerId: string,
  input: PublishPlaybackSessionInput,
): Promise<UpsertPlaybackSessionResult> {
  const db = getDb();
  const existing = await getPlaybackSessionByPlayerId(playerId);
  const staleVersion =
    existing &&
    input.stateVersion !== undefined &&
    input.stateVersion < existing.stateVersion;
  const allowStaleVersionForNewerSemanticState =
    Boolean(existing) &&
    staleVersion &&
    isNewerSemanticPlaybackInput(existing!, input);

  if (staleVersion && !allowStaleVersionForNewerSemanticState) {
    logPlaybackRepositoryCurrentDebug("H4", "playback session rejected as stale", {
      playerId,
      inputStateVersion: input.stateVersion,
      existingStateVersion: existing.stateVersion,
      inputDeviceId: input.deviceId,
      existingActiveDeviceId: existing.activeDeviceId,
      inputPreferredDeviceId: input.preferredDeviceId ?? null,
      existingPreferredDeviceId: existing.preferredDeviceId,
      inputActiveDeviceName: input.activeDeviceName ?? null,
      existingActiveDeviceName: existing.activeDeviceName,
    });
    return { session: existing, accepted: false };
  }

  const now = new Date();
  const nextVersion = (existing?.stateVersion ?? 0) + 1;
  const progressMs = resolvePersistedProgressMs(input);
  const progressAnchor = resolveProgressAnchorIso(input, now);

  const values = {
    playerId,
    spotifyUserId: input.spotifyUserId ?? existing?.spotifyUserId ?? null,
    activeDeviceId: input.deviceId,
    currentTrackUri: input.trackUri,
    trackName: input.trackName,
    artistName: input.artistName,
    albumImageUrl: input.albumImageUrl ?? null,
    progressMs,
    durationMs: input.durationMs,
    paused: input.paused,
    status: input.status,
    lastError: input.lastError ?? null,
    syncMode: input.syncMode ?? existing?.syncMode ?? "api_device",
    preferredDeviceId:
      input.preferredDeviceId !== undefined
        ? input.preferredDeviceId
        : (existing?.preferredDeviceId ?? null),
    activeDeviceName:
      input.activeDeviceName !== undefined
        ? input.activeDeviceName
        : (existing?.activeDeviceName ?? null),
    stateVersion: nextVersion,
    stateSource: input.stateSource ?? existing?.stateSource ?? "unknown",
    authority: input.authority ?? existing?.authority ?? "unknown",
    sdkDeviceId:
      input.sdkDeviceId !== undefined
        ? input.sdkDeviceId
        : (existing?.sdkDeviceId ?? null),
    browserInstanceId:
      input.browserInstanceId !== undefined
        ? input.browserInstanceId
        : (existing?.browserInstanceId ?? null),
    browserVisibility:
      input.browserVisibility ?? existing?.browserVisibility ?? "unknown",
    browserLastSeenAt:
      input.browserLastSeenAt !== undefined
        ? optionalIsoToDate(input.browserLastSeenAt)
        : optionalIsoToDate(existing?.browserLastSeenAt ?? null),
    sourceUpdatedAt:
      input.sourceUpdatedAt !== undefined
        ? optionalIsoToDate(input.sourceUpdatedAt)
        : progressAnchor,
    updatedAt: now,
  };

  await db
    .insert(playerSessions)
    .values(values)
    .onConflictDoUpdate({
      target: playerSessions.playerId,
      set: {
        spotifyUserId: values.spotifyUserId,
        activeDeviceId: values.activeDeviceId,
        currentTrackUri: values.currentTrackUri,
        trackName: values.trackName,
        artistName: values.artistName,
        albumImageUrl: values.albumImageUrl,
        progressMs: values.progressMs,
        durationMs: values.durationMs,
        paused: values.paused,
        status: values.status,
        lastError: values.lastError,
        syncMode: values.syncMode,
        preferredDeviceId: values.preferredDeviceId,
        activeDeviceName: values.activeDeviceName,
        stateSource: values.stateSource,
        authority: values.authority,
        sdkDeviceId: values.sdkDeviceId,
        browserInstanceId: values.browserInstanceId,
        browserVisibility: values.browserVisibility,
        browserLastSeenAt: values.browserLastSeenAt,
        sourceUpdatedAt: values.sourceUpdatedAt,
        stateVersion: values.stateVersion,
        updatedAt: values.updatedAt,
      },
    });

  const session = await getPlaybackSessionByPlayerId(playerId);
  if (!session) {
    throw new Error("Failed to persist playback session");
  }
  logPlaybackRepositoryCurrentDebug("H4", "playback session persisted", {
    playerId,
    accepted: true,
    inputStateVersion: input.stateVersion ?? null,
    existingStateVersion: existing?.stateVersion ?? null,
    persistedStateVersion: session.stateVersion,
    inputDeviceId: input.deviceId,
    persistedActiveDeviceId: session.activeDeviceId,
    inputPreferredDeviceId: input.preferredDeviceId ?? null,
    persistedPreferredDeviceId: session.preferredDeviceId,
    inputActiveDeviceName: input.activeDeviceName ?? null,
    persistedActiveDeviceName: session.activeDeviceName,
    status: session.status,
    stateSource: session.stateSource,
    authority: session.authority,
  });
  return { session, accepted: true };
}
