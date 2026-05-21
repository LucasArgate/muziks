/** Pure helper — safe for client bundles (no server/db imports). */
export function computeExpectedEndAt(input: {
  positionUpdatedAt: number;
  positionMs: number;
  durationMs: number;
}): Date {
  const remaining = Math.max(0, input.durationMs - input.positionMs);
  return new Date(input.positionUpdatedAt + remaining);
}
