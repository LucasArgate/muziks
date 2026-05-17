/** Snapshot de progresso: posição conhecida num instante (ms epoch). */
export type PlaybackProgressSnapshot = {
  positionMs: number;
  durationMs: number;
  paused: boolean;
  positionUpdatedAt: number;
};

export function formatPlaybackTime(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Posição atual = posição na referência + (agora − referência), limitada à duração. */
export function computeLivePositionMs(
  snapshot: PlaybackProgressSnapshot,
  now = Date.now(),
): number {
  const { positionMs, durationMs, paused, positionUpdatedAt } = snapshot;
  if (durationMs <= 0) return 0;
  if (paused) return Math.min(positionMs, durationMs);
  const elapsed = Math.max(0, now - positionUpdatedAt);
  return Math.min(positionMs + elapsed, durationMs);
}

export function computeProgressPercent(
  snapshot: PlaybackProgressSnapshot,
  now = Date.now(),
): number {
  const { durationMs } = snapshot;
  if (durationMs <= 0) return 0;
  return Math.min(
    100,
    (computeLivePositionMs(snapshot, now) / durationMs) * 100,
  );
}
