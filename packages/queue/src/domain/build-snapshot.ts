import type { MuziksQueueSnapshot, QueueItemDto } from "@muziks/types";
import type { QueueItemRow } from "@muziks/db";

import { computeQueueVersion, toQueueItemDto } from "@muziks/db";

import { sortQueueItemsForDisplay } from "./sort-queue-items";

export function buildMuziksQueueSnapshot(
  playerId: string,
  rows: QueueItemRow[],
): MuziksQueueSnapshot {
  const dtos = rows.map(toQueueItemDto);
  const items = sortQueueItemsForDisplay(dtos);
  const version = computeQueueVersion(rows);
  const updatedAt = rows.reduce<Date | null>((latest, row) => {
    if (!latest || row.updatedAt > latest) {
      return row.updatedAt;
    }
    return latest;
  }, null);

  return {
    playerId,
    version,
    items,
    updatedAt: (updatedAt ?? new Date()).toISOString(),
  };
}

export function pickQueueHead(items: QueueItemDto[]): QueueItemDto | null {
  const queued = items.filter((item) => item.state === "queued");
  if (queued.length === 0) {
    return null;
  }
  return [...queued].sort((a, b) => a.position - b.position)[0] ?? null;
}
