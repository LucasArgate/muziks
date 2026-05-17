export function getSpotifyClientId(): string {
  const id = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  if (!id) {
    throw new Error("NEXT_PUBLIC_SPOTIFY_CLIENT_ID is not set");
  }
  return id;
}

export function getSpotifyClientSecret(): string | undefined {
  return process.env.SPOTIFY_CLIENT_SECRET;
}

export function getPlayerAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_PLAYER_APP_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_PLAYER_APP_URL is not set");
  }
  return url.replace(/\/$/, "");
}

export function getSpotifyRedirectUri(): string {
  return `${getPlayerAppUrl()}/api/spotify/callback`;
}
