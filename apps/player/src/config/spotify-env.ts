export function getSpotifyClientId(): string {
  const id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  if (!id) {
    throw new Error("NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not set");
  }
  return id;
}

export function getSpotifyClientSecret(): string | undefined {
  const secret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  if (!secret) {
    return undefined;
  }
  if (/\s/.test(secret)) {
    throw new Error(
      "SPOTIFY_CLIENT_SECRET must be a single line (no spaces or line breaks)",
    );
  }
  return secret;
}

export function getPlayerAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_PLAYER_APP_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_PLAYER_APP_URL is not set");
  }
  return url.replace(/\/$/, "");
}

const LOCALHOST_ALIASES = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

function readRequestOrigin(request: Request): string | null {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host || host.startsWith("0.0.0.0")) {
    return null;
  }

  const proto =
    request.headers.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");

  return `${proto}://${host}`.replace(/\/$/, "");
}

function originsMatch(a: string, b: string): boolean {
  try {
    const left = new URL(a);
    const right = new URL(b);

    if (left.origin === right.origin) {
      return true;
    }

    const bothLocal =
      LOCALHOST_ALIASES.has(left.hostname) &&
      LOCALHOST_ALIASES.has(right.hostname);

    return bothLocal && left.port === right.port;
  } catch {
    return false;
  }
}

/** Origins allowed for OAuth redirects (configured URL + optional extras). */
export function getAllowedPlayerOrigins(): string[] {
  const origins = [getPlayerAppUrl()];
  const extra = process.env.PLAYER_ALLOWED_APP_ORIGINS?.split(",") ?? [];
  for (const entry of extra) {
    const trimmed = entry.trim().replace(/\/$/, "");
    if (!trimmed) continue;
    const normalized = trimmed.includes("://")
      ? trimmed
      : `https://${trimmed}`;
    if (!origins.some((o) => originsMatch(o, normalized))) {
      origins.push(normalized);
    }
  }
  return origins;
}

function isAllowedPlayerOrigin(origin: string): boolean {
  return getAllowedPlayerOrigins().some((allowed) =>
    originsMatch(origin, allowed),
  );
}

/**
 * Public base URL for redirects. Uses the request host when it matches an
 * allowed origin (staging, dev IP, etc.); otherwise falls back to env.
 */
export function getPlayerAppUrlFromRequest(request: Request): string {
  const configured = getPlayerAppUrl();
  const fromRequest = readRequestOrigin(request);

  if (fromRequest && isAllowedPlayerOrigin(fromRequest)) {
    return fromRequest;
  }

  return configured;
}

/** Must match a redirect URI registered in the Spotify Dashboard. */
export function getSpotifyRedirectUri(request?: Request): string {
  const base = request ? getPlayerAppUrlFromRequest(request) : getPlayerAppUrl();
  return `${base}/api/spotify/callback`;
}
