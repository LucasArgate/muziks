import type { QueueItemDto } from "@muziks/types";

/** Display order: votes DESC, then earlier request wins ties (spec 06). */
export function sortQueueItemsForDisplay(items: QueueItemDto[]): QueueItemDto[] {
  return [...items].sort((a, b) => {
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }
    return (
      new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime()
    );
  });
}
