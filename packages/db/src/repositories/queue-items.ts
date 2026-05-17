import type { QueueItemDto, QueueItemState } from "@muziks/types";
import { and, asc, eq, inArray } from "drizzle-orm";

import { getDb } from "../client";
import { queueDequeueLedger, queueItems } from "../schema/queue-items";

export type QueueItemRow = typeof queueItems.$inferSelect;

const VISIBLE_STATES: QueueItemState[] = [
  "pending",
  "queued",
  "playing",
  "played",
];

export function toQueueItemDto(row: QueueItemRow): QueueItemDto {
  return {
    id: row.id,
    playerId: row.playerId,
    spotifyUri: row.spotifyUri,
    isrc: row.isrc,
    title: row.title,
    artist: row.artist,
    votes: row.votes,
    position: row.position,
    state: row.state as QueueItemState,
    requestedAt: row.createdAt.toISOString(),
  };
}

export async function listQueueItemsForPlayer(
  playerId: string,
): Promise<QueueItemRow[]> {
  const db = getDb();
  return db
    .select()
    .from(queueItems)
    .where(
      and(
        eq(queueItems.playerId, playerId),
        inArray(queueItems.state, VISIBLE_STATES),
      ),
    )
    .orderBy(asc(queueItems.position));
}

export async function findDequeueLedgerResult(
  playerId: string,
  idempotencyKey: string,
): Promise<string | null> {
  const db = getDb();
  const rows = await db
    .select({ result: queueDequeueLedger.result })
    .from(queueDequeueLedger)
    .where(
      and(
        eq(queueDequeueLedger.playerId, playerId),
        eq(queueDequeueLedger.idempotencyKey, idempotencyKey),
      ),
    )
    .limit(1);

  return rows[0]?.result ?? null;
}

export async function saveDequeueLedgerResult(
  playerId: string,
  idempotencyKey: string,
  resultJson: string,
): Promise<void> {
  const db = getDb();
  await db
    .insert(queueDequeueLedger)
    .values({
      playerId,
      idempotencyKey,
      result: resultJson,
    })
    .onConflictDoNothing();
}

export type DequeueNextResult = {
  dequeued: QueueItemRow | null;
  remainingQueued: QueueItemRow[];
  allVisible: QueueItemRow[];
};

export async function dequeueNextQueuedItem(
  playerId: string,
): Promise<DequeueNextResult> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const headRows = await tx
      .select()
      .from(queueItems)
      .where(
        and(eq(queueItems.playerId, playerId), eq(queueItems.state, "queued")),
      )
      .orderBy(asc(queueItems.position))
      .limit(1)
      .for("update");

    const head = headRows[0] ?? null;
    if (!head) {
      const allVisible = await tx
        .select()
        .from(queueItems)
        .where(
          and(
            eq(queueItems.playerId, playerId),
            inArray(queueItems.state, VISIBLE_STATES),
          ),
        )
        .orderBy(asc(queueItems.position));

      return { dequeued: null, remainingQueued: [], allVisible };
    }

    const now = new Date();
    await tx
      .update(queueItems)
      .set({ state: "played", updatedAt: now })
      .where(eq(queueItems.id, head.id));

    const remainingQueued = await tx
      .select()
      .from(queueItems)
      .where(
        and(eq(queueItems.playerId, playerId), eq(queueItems.state, "queued")),
      )
      .orderBy(asc(queueItems.position))
      .for("update");

    let position = 0;
    for (const item of remainingQueued) {
      await tx
        .update(queueItems)
        .set({ position, updatedAt: now })
        .where(eq(queueItems.id, item.id));
      position += 1;
    }

    const allVisible = await tx
      .select()
      .from(queueItems)
      .where(
        and(
          eq(queueItems.playerId, playerId),
          inArray(queueItems.state, VISIBLE_STATES),
        ),
      )
      .orderBy(asc(queueItems.position));

    const dequeued: QueueItemRow = { ...head, state: "played", updatedAt: now };

    return {
      dequeued,
      remainingQueued: allVisible.filter((row) => row.state === "queued"),
      allVisible,
    };
  });
}

export function computeQueueVersion(rows: QueueItemRow[]): number {
  if (rows.length === 0) {
    return 0;
  }
  return rows.reduce(
    (max, row) => Math.max(max, row.updatedAt.getTime()),
    0,
  );
}

export async function seedQueueItemsIfEmpty(
  playerId: string,
): Promise<void> {
  const db = getDb();
  const existing = await db
    .select({ id: queueItems.id })
    .from(queueItems)
    .where(eq(queueItems.playerId, playerId))
    .limit(1);

  if (existing.length > 0) {
    return;
  }

  const samples = [
    {
      title: "Bohemian Rhapsody",
      artist: "Queen",
      spotifyUri: "spotify:track:3z8h0TUzp4SE0HwMuHnfsL",
    },
    {
      title: "Don't Stop Me Now",
      artist: "Queen",
      spotifyUri: "spotify:track:5T8EDUDqKcs6OSOwEsfqG7",
    },
    {
      title: "Under Pressure",
      artist: "Queen & David Bowie",
      spotifyUri: "spotify:track:0mv8A1Ng7CjbVyC960TvhA",
    },
  ];

  await db.insert(queueItems).values(
    samples.map((sample, index) => ({
      playerId,
      spotifyUri: sample.spotifyUri,
      title: sample.title,
      artist: sample.artist,
      votes: samples.length - index,
      position: index,
      state: "queued",
    })),
  );
}
