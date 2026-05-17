import { and, eq, sql } from "drizzle-orm";

import { getDb } from "../client";
import { queueItems } from "../schema/queue-items";
import { voteEvents } from "../schema/vote-events";

export type CastVoteResult =
  | { ok: true; votes: number }
  | { ok: false; code: "queue_item_not_found" | "already_voted" };

export async function castVoteOnQueueItem(input: {
  playerId: string;
  queueItemId: string;
  profileId: string;
}): Promise<CastVoteResult> {
  const db = getDb();

  const itemRows = await db
    .select({ id: queueItems.id })
    .from(queueItems)
    .where(
      and(
        eq(queueItems.id, input.queueItemId),
        eq(queueItems.playerId, input.playerId),
      ),
    )
    .limit(1);

  if (!itemRows[0]) {
    return { ok: false, code: "queue_item_not_found" };
  }

  const inserted = await db
    .insert(voteEvents)
    .values({
      playerId: input.playerId,
      queueItemId: input.queueItemId,
      profileId: input.profileId,
    })
    .onConflictDoNothing()
    .returning({ id: voteEvents.id });

  if (inserted.length === 0) {
    return { ok: false, code: "already_voted" };
  }

  const updated = await db
    .update(queueItems)
    .set({
      votes: sql`${queueItems.votes} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(queueItems.id, input.queueItemId))
    .returning({ votes: queueItems.votes });

  return { ok: true, votes: updated[0]?.votes ?? 0 };
}
