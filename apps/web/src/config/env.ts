export function getSpotifyClientId(): string {
  const id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  if (!id) {
    throw new Error("NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not set");
  }
  return id;
}

export function getSpotifyClientSecret(): string | undefined {
  const secret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  return secret || undefined;
}

export function getWebAppUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_WEB_APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_WEB_APP_URL is not set");
  }
  return url.replace(/\/$/, "");
}

/** Player master — prod: https://player.muziks.app; staging: https://staging-player.muziks.app */
export function getPlayerAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_PLAYER_APP_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_PLAYER_APP_URL is not set");
  }
  return url.replace(/\/$/, "");
}

function readRequestOrigin(request: Request): string | null {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) {
    return null;
  }
  const proto =
    request.headers.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`.replace(/\/$/, "");
}

export function getWebAppUrlFromRequest(request: Request): string {
  const fromRequest = readRequestOrigin(request);
  if (fromRequest) {
    return fromRequest;
  }
  return getWebAppUrl();
}

export function getSpotifyRedirectUri(request?: Request): string {
  const base = request ? getWebAppUrlFromRequest(request) : getWebAppUrl();
  return `${base}/api/auth/spotify/callback`;
}
