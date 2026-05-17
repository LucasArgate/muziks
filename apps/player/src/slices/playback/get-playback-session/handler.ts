import { playbackSessionSchema } from "@muziks/types";

import { assertPlayerSlugAccess } from "@/src/lib/playback/assert-player-slug-access";
import { getPlaybackSessionByPlayerId } from "@/src/lib/playback/playback-session-repository";

export async function getPlaybackSessionHandler(slug: string) {
  const access = await assertPlayerSlugAccess(slug);
  if (!access) {
    return { status: 403 as const, body: { error: "forbidden" } };
  }

  const session = await getPlaybackSessionByPlayerId(access.playerId);
  if (!session) {
    return { status: 404 as const, body: { error: "not_found" } };
  }

  return {
    status: 200 as const,
    body: playbackSessionSchema.parse(session),
  };
}
