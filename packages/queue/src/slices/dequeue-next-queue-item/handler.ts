import {
  dequeueNextQueuedItem,
  findDequeueLedgerResult,
  saveDequeueLedgerResult,
  seedQueueItemsIfEmpty,
  toQueueItemDto,
} from "@muziks/db";
import {
  dequeueNextQueueItemInputSchema,
  dequeueNextQueueItemResultSchema,
  type DequeueNextQueueItemInput,
} from "@muziks/types";

import {
  buildMuziksQueueSnapshot,
  pickQueueHead,
} from "../../domain/build-snapshot";

export type DequeueNextQueueItemHandlerResult =
  | { status: 400; body: { error: "invalid_body"; details?: unknown } }
  | { status: 200; body: ReturnType<typeof dequeueNextQueueItemResultSchema.parse> };

export async function dequeueNextQueueItemHandler(
  playerId: string,
  rawBody: unknown,
): Promise<DequeueNextQueueItemHandlerResult> {
  const parsed = dequeueNextQueueItemInputSchema.safeParse(rawBody ?? {});
  if (!parsed.success) {
    return {
      status: 400,
      body: { error: "invalid_body", details: parsed.error.flatten() },
    };
  }

  if (process.env.NODE_ENV === "development") {
    await seedQueueItemsIfEmpty(playerId);
  }

  const cached = await tryReadIdempotentResult(playerId, parsed.data);
  if (cached) {
    return { status: 200, body: cached };
  }

  const { dequeued, allVisible } = await dequeueNextQueuedItem(playerId);
  const snapshot = buildMuziksQueueSnapshot(playerId, allVisible);
  const head = pickQueueHead(snapshot.items);

  const result = dequeueNextQueueItemResultSchema.parse({
    dequeued: dequeued ? toQueueItemDto(dequeued) : null,
    head,
    snapshot,
  });

  await persistIdempotentResult(playerId, parsed.data, result);

  return { status: 200, body: result };
}

async function tryReadIdempotentResult(
  playerId: string,
  input: DequeueNextQueueItemInput,
) {
  if (!input.idempotencyKey) {
    return null;
  }

  const cachedJson = await findDequeueLedgerResult(
    playerId,
    input.idempotencyKey,
  );
  if (!cachedJson) {
    return null;
  }

  try {
    return dequeueNextQueueItemResultSchema.parse(JSON.parse(cachedJson));
  } catch {
    return null;
  }
}

async function persistIdempotentResult(
  playerId: string,
  input: DequeueNextQueueItemInput,
  result: ReturnType<typeof dequeueNextQueueItemResultSchema.parse>,
) {
  if (!input.idempotencyKey) {
    return;
  }

  await saveDequeueLedgerResult(
    playerId,
    input.idempotencyKey,
    JSON.stringify(result),
  );
}
