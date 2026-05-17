import { NextResponse } from "next/server";

import { dequeueNextQueueItemHandler } from "@muziks/queue";

import { assertPlayerSlugAccess } from "@/src/lib/playback/assert-player-slug-access";
import { broadcastQueueSnapshotFromServer } from "@/src/lib/realtime/muziks-queue-broadcast-server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { slug } = await context.params;

  const access = await assertPlayerSlugAccess(slug);
  if (!access) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const result = await dequeueNextQueueItemHandler(access.playerId, body);

    if (result.status === 200) {
      await broadcastQueueSnapshotFromServer(access.playerId, {
        ...result.body.snapshot,
        source: "dequeue",
      });
    }

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "muziks_dequeue_error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
