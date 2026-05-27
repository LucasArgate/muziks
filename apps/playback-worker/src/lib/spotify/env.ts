function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name}_missing`);
  }
  return value;
}

export function getSpotifyClientId(): string {
  return (
    process.env.SPOTIFY_CLIENT_ID?.trim() ??
    readRequiredEnv("NEXT_PUBLIC_SPOTIFY_CLIENT_ID")
  );
}

export function getSpotifyClientSecret(): string {
  return readRequiredEnv("SPOTIFY_CLIENT_SECRET");
}
