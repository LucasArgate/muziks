function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name}_missing`);
  }
  return value;
}

export function getSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL?.trim() ??
    readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL")
  );
}

export function getSupabaseServiceRoleKey(): string {
  return readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getSpotifyTokenEncryptionKey(): string {
  const dedicated = process.env.SPOTIFY_TOKEN_ENCRYPTION_KEY?.trim();
  if (dedicated) {
    return dedicated;
  }
  return getSupabaseServiceRoleKey();
}
