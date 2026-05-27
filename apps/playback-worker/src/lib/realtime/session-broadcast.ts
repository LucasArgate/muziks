import {
  PLAYER_SESSION_BROADCAST_EVENT,
  sessionSnapshotBroadcastSchema,
  type SessionSnapshotBroadcast,
} from "@muziks/types";
import {
  playbackSessionToNormalized,
  type BackgroundPlaybackSession,
} from "@muziks/playback";

import { createSupabaseAdminClient } from "../supabase/admin.js";
import { playerSessionChannelName } from "./player-session-channel-name.js";

async function withBroadcastChannel<T>(
  playerId: string,
  send: (
    channel: ReturnType<ReturnType<typeof createSupabaseAdminClient>["channel"]>,
  ) => Promise<T>,
): Promise<T> {
  const supabase = createSupabaseAdminClient();
  const channel = supabase.channel(playerSessionChannelName(playerId), {
    config: { broadcast: { self: false } },
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
    return await send(channel);
  } finally {
    await channel.unsubscribe();
  }
}

function sessionToBroadcastPayload(
  session: BackgroundPlaybackSession,
): SessionSnapshotBroadcast {
  const progressUpdatedAt =
    session.sourceUpdatedAt?.getTime() ?? session.updatedAt.getTime();

  return {
    playback: {
      ...playbackSessionToNormalized(session),
      positionUpdatedAt: progressUpdatedAt,
    },
    stateVersion: session.stateVersion,
    stateSource: session.stateSource as SessionSnapshotBroadcast["stateSource"],
    authority: session.authority as SessionSnapshotBroadcast["authority"],
    sourceUpdatedAt: session.sourceUpdatedAt?.toISOString() ?? null,
  };
}

export async function publishWorkerSessionSnapshot(input: {
  playerId: string;
  session: BackgroundPlaybackSession;
}): Promise<void> {
  const parsed = sessionSnapshotBroadcastSchema.safeParse(
    sessionToBroadcastPayload(input.session),
  );
  if (!parsed.success) {
    return;
  }

  try {
    await withBroadcastChannel(input.playerId, async (channel) => {
      await channel.send({
        type: "broadcast",
        event: PLAYER_SESSION_BROADCAST_EVENT,
        payload: parsed.data,
      });
    });
  } catch {
    // best-effort fan-out
  }
}
