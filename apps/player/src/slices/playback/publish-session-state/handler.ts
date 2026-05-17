import {
  playbackSessionSchema,
  publishPlaybackSessionInputSchema,
} from "@muziks/types";

import { assertPlayerSlugAccess } from "@/src/lib/playback/assert-player-slug-access";
import { upsertPlaybackSession } from "@/src/lib/playback/playback-session-repository";

export async function publishSessionStateHandler(
  slug: string,
  rawBody: unknown,
) {
  const access = await assertPlayerSlugAccess(slug);
  if (!access) {
    return { status: 403 as const, body: { error: "forbidden" } };
  }

  const parsed = publishPlaybackSessionInputSchema.safeParse(rawBody);
  if (!parsed.success) {
    return {
      status: 400 as const,
      body: { error: "invalid_body", details: parsed.error.flatten() },
    };
  }

  const session = await upsertPlaybackSession(access.playerId, parsed.data);
  return {
    status: 200 as const,
    body: playbackSessionSchema.parse(session),
  };
}
