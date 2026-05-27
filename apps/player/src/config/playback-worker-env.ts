export function getPlaybackWorkerSecret(): string {
  const secret = process.env.PLAYBACK_WORKER_SECRET?.trim();
  if (!secret) {
    throw new Error("PLAYBACK_WORKER_SECRET is not set");
  }
  return secret;
}

function readOptionalBearerSecret(name: string): string | null {
  const value = process.env[name]?.trim();
  return value || null;
}

export function isPlaybackWorkerAuthorized(
  authorizationHeader: string | null,
): boolean {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return false;
  }
  const token = authorizationHeader.slice("Bearer ".length).trim();
  const allowed = new Set<string>();
  try {
    allowed.add(getPlaybackWorkerSecret());
  } catch {
    // PLAYBACK_WORKER_SECRET unset — only CRON_SECRET may authorize.
  }
  const cronSecret = readOptionalBearerSecret("CRON_SECRET");
  if (cronSecret) {
    allowed.add(cronSecret);
  }
  return allowed.has(token);
}
