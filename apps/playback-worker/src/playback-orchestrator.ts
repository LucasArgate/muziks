import { createTokenCrypto, getAccessTokenForPlayer } from "@muziks/db";
import {
  playbackSessionToNormalized,
  runBackgroundPlaybackOrchestrator,
  type PlaybackSessionRow,
  type RunPlaybackOrchestratorResult,
} from "@muziks/playback";
import {
  PLAYER_SESSION_BROADCAST_EVENT,
  sessionSnapshotBroadcastSchema,
} from "@muziks/types";
import { createClient } from "@supabase/supabase-js";

import { getPlaybackWorkerConfig } from "./config.js";

async function broadcastSessionSnapshot(
  input: { playerId: string; session: PlaybackSessionRow },
): Promise<void> {
  const config = getPlaybackWorkerConfig();
  const supabase = createClient(
    config.supabaseUrl,
    config.supabaseServiceRoleKey,
  );
  const channel = supabase.channel(`player:${input.playerId}`, {
    config: { broadcast: { self: false } },
  });

  const payload = sessionSnapshotBroadcastSchema.parse({
    playback: playbackSessionToNormalized(input.session),
    stateVersion: input.session.stateVersion,
    stateSource: input.session.stateSource,
    authority: input.session.authority,
    sourceUpdatedAt: input.session.sourceUpdatedAt?.toISOString() ?? null,
  });

  await new Promise<void>((resolve, reject) => {
    channel.subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        resolve();
        return;
      }
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        reject(err ?? new Error(`realtime_${status.toLowerCase()}`));
      }
    });
  });

  try {
    await channel.send({
      type: "broadcast",
      event: PLAYER_SESSION_BROADCAST_EVENT,
      payload,
    });
  } finally {
    await channel.unsubscribe();
  }
}

async function getWorkerAccessToken(playerId: string): Promise<string | null> {
  const config = getPlaybackWorkerConfig();
  const tokenCrypto = createTokenCrypto(config.spotifyTokenEncryptionKey);
  return getAccessTokenForPlayer(playerId, {
    clientId: config.spotifyClientId,
    clientSecret: config.spotifyClientSecret,
    encrypt: tokenCrypto.encrypt,
    decrypt: tokenCrypto.decrypt,
  });
}

export async function runPlaybackOrchestrator(): Promise<RunPlaybackOrchestratorResult> {
  return runBackgroundPlaybackOrchestrator({
    getAccessToken: getWorkerAccessToken,
    publishSessionSnapshot: broadcastSessionSnapshot,
  });
}
