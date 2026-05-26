const DEFAULT_RETRIES = 2;

export class SpotifyRateLimitError extends Error {
  readonly retryAfterMs: number;
  readonly status = 429;

  constructor(retryAfterMs: number) {
    super("spotify_rate_limited");
    this.name = "SpotifyRateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveRetryAfterMs(response: Response): number {
  const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
  return Math.max(retryAfter, 1) * 1000;
}

/** Fetch wrapper with Spotify 429 backoff (used by @spotify/web-api-ts-sdk). */
export function createSpotifyFetchWithRetry(
  retries = DEFAULT_RETRIES,
): typeof fetch {
  return async (req, init) => {
    let attempt = 0;

    while (true) {
      const response = await fetch(req, init);

      if (response.status === 429) {
        const retryAfterMs = resolveRetryAfterMs(response);
        if (attempt < retries) {
          await sleep(retryAfterMs * 2 ** attempt);
          attempt += 1;
          continue;
        }

        throw new SpotifyRateLimitError(retryAfterMs);
      }

      return response;
    }
  };
}
