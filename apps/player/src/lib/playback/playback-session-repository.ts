import { getDb, playerSessions } from "@muziks/db";
import type {
  NormalizedSpotifyPlayerState,
  PlaybackSession,
  PlaybackSessionStatus,
  PlaybackSyncMode,
  PublishPlaybackSessionInput,
} from "@muziks/types";
import { eq } from "drizzle-orm";

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
    stateVersion: row.stateVersion ?? 0,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function playbackSessionToNormalized(
  session: PlaybackSession,
): NormalizedSpotifyPlayerState {
  return {
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

  if (
    existing &&
    input.stateVersion !== undefined &&
    input.stateVersion < existing.stateVersion
  ) {
    return { session: existing, accepted: false };
  }

  const now = new Date();
  const nextVersion = (existing?.stateVersion ?? 0) + 1;

  const values = {
    playerId,
    spotifyUserId: input.spotifyUserId ?? existing?.spotifyUserId ?? null,
    activeDeviceId: input.deviceId,
    currentTrackUri: input.trackUri,
    trackName: input.trackName,
    artistName: input.artistName,
    albumImageUrl: input.albumImageUrl ?? null,
    progressMs: input.positionMs,
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
        stateVersion: values.stateVersion,
        updatedAt: values.updatedAt,
      },
    });

  const session = await getPlaybackSessionByPlayerId(playerId);
  if (!session) {
    throw new Error("Failed to persist playback session");
  }
  return { session, accepted: true };
}
