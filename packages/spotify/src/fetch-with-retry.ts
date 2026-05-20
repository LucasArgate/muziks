const DEFAULT_RETRIES = 2;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch wrapper with Spotify 429 backoff (used by @spotify/web-api-ts-sdk). */
export function createSpotifyFetchWithRetry(
  retries = DEFAULT_RETRIES,
): typeof fetch {
  return async (req, init) => {
    let attempt = 0;

    while (true) {
      const response = await fetch(req, init);

      if (response.status === 429 && attempt < retries) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
        await sleep(Math.max(retryAfter, 1) * 1000 * 2 ** attempt);
        attempt += 1;
        continue;
      }

      return response;
    }
  };
}
