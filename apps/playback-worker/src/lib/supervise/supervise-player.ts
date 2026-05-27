import {
  claimPlayersForBackgroundTick,
  createDrizzleSpotifyBackgroundPlaybackPorts,
  isPlayerEligibleForBackgroundTick,
  resolveNextPlaybackTickAt,
  tickBackgroundPlayer,
  type TickPlayerResult,
} from "@muziks/playback";

import { publishWorkerSessionSnapshot } from "../realtime/session-broadcast.js";
import { getAccessTokenForPlayer } from "../spotify/token-vault.js";

export type SupervisePlayerSource = "schedule" | "realtime" | "supervisor";

export type SupervisePlayerResult = {
  playerId: string;
  skipped?: "locked" | "not_eligible";
  tick?: TickPlayerResult;
  nextTickAt?: string;
  scheduledNext?: boolean;
};

function createSupervisePorts() {
  return createDrizzleSpotifyBackgroundPlaybackPorts({
    getAccessToken: getAccessTokenForPlayer,
    publishSessionSnapshot: publishWorkerSessionSnapshot,
  });
}

export async function superviseBackgroundPlayer(
  playerId: string,
): Promise<SupervisePlayerResult> {
  const [claimed] = await claimPlayersForBackgroundTick([playerId]);
  if (!claimed) {
    return { playerId, skipped: "locked" };
  }

  const eligible = await isPlayerEligibleForBackgroundTick(playerId);
  if (!eligible) {
    return { playerId, skipped: "not_eligible" };
  }

  const ports = createSupervisePorts();
  const tick = await tickBackgroundPlayer(playerId, ports);
  await ports.savePollCursor(tick);

  const nextTickAt = resolveNextPlaybackTickAt(tick);

  return {
    playerId,
    tick,
    nextTickAt: nextTickAt.toISOString(),
    scheduledNext: false,
  };
}

export function resolveSuperviseDelayMs(nextTickAt: Date, now = Date.now()): number {
  return Math.max(nextTickAt.getTime() - now, 1_000);
}

export function buildScheduledSuperviseIdempotencyKey(
  playerId: string,
  nextTickAt: Date,
): string {
  return `supervise:${playerId}:at:${nextTickAt.getTime()}`;
}

export function buildRealtimeSuperviseIdempotencyKey(
  playerId: string,
  stateVersion: number,
): string {
  return `supervise:${playerId}:rev:${stateVersion}`;
}

export function buildSupervisorWakeIdempotencyKey(playerId: string): string {
  return `supervise:${playerId}:safety`;
}
