import type { MirrorNextToSpotifyQueueResult } from "@muziks/types";

export type MirrorNextOptions = {
  deviceId?: string | null;
  currentTrackUri?: string | null;
  lookahead?: number;
};

export async function mirrorNextOnSpotifyQueue(
  slug: string,
  options: MirrorNextOptions = {},
): Promise<MirrorNextToSpotifyQueueResult | null> {
  const response = await fetch(
    `/api/players/${encodeURIComponent(slug)}/playback/mirror-next`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: options.deviceId ?? undefined,
        currentTrackUri: options.currentTrackUri ?? null,
        lookahead: options.lookahead,
      }),
    },
  );

  const body = (await response.json().catch(() => null)) as
    | MirrorNextToSpotifyQueueResult
    | { error?: string }
    | null;

  if (
    !response.ok ||
    !body ||
    typeof body !== "object" ||
    !("reason" in body) ||
    !("mirrored" in body)
  ) {
    return null;
  }

  return body as MirrorNextToSpotifyQueueResult;
}
