import type { NormalizedSpotifyPlaybackQueue } from "@muziks/types";

export function fingerprintSpotifyQueue(
  queue: NormalizedSpotifyPlaybackQueue,
): string {
  const current = queue.currentlyPlaying?.uri ?? "";
  const upcoming = queue.upcoming.map((track) => track.uri).join(",");
  return `${current}|${upcoming}`; 
}
