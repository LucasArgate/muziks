export function getPlaybackWorkerSecret(): string {
  const secret = process.env.PLAYBACK_WORKER_SECRET?.trim();
  if (!secret) {
    throw new Error("PLAYBACK_WORKER_SECRET is not set");
  }
  return secret;
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
    // PLAYBACK_WORKER_SECRET unset — no Bearer auth for internal tick.
  }
  return allowed.has(token);
}
