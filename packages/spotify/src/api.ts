import { SPOTIFY_API_BASE } from "./constants";

export type SpotifyFetchOptions = RequestInit & {
  accessToken: string;
  retries?: number;
};

export async function spotifyFetch<T>(
  path: string,
  { accessToken, retries = 2, ...init }: SpotifyFetchOptions,
): Promise<T> {
  const url = path.startsWith("http") ? path : `${SPOTIFY_API_BASE}${path}`;
  let attempt = 0;

  while (true) {
    const response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    if (response.status === 429 && attempt < retries) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "1");
      await sleep(Math.max(retryAfter, 1) * 1000 * 2 ** attempt);
      attempt += 1;
      continue;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Spotify API ${response.status}: ${text}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
