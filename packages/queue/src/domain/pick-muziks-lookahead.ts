import type { QueueItemDto } from "@muziks/types";

import { sortQueueItemsForDisplay } from "./sort-queue-items";

/**
 * URIs to mirror on the Spotify native queue after the track currently playing.
 * Skips played/removed; starts after the playing item or the first queued head.
 */
export function pickMuziksLookaheadUris(
  items: QueueItemDto[],
  currentTrackUri: string | null,
  lookahead = 3,
): string[] {
  if (lookahead <= 0) {
    return [];
  }

  const sorted = sortQueueItemsForDisplay(items);
  const visible = sorted.filter(
    (item) => item.state === "queued" || item.state === "playing",
  );

  let startIndex = 0;
  if (currentTrackUri) {
    const playingIndex = visible.findIndex(
      (item) =>
        item.state === "playing" || item.spotifyUri === currentTrackUri,
    );
    if (playingIndex >= 0) {
      startIndex = playingIndex + 1;
    }
  }

  const uris: string[] = [];
  for (let i = startIndex; i < visible.length && uris.length < lookahead; i += 1) {
    const item = visible[i];
    if (item.state !== "queued") {
      continue;
    }
    if (!uris.includes(item.spotifyUri)) {
      uris.push(item.spotifyUri);
    }
  }

  return uris;
}
