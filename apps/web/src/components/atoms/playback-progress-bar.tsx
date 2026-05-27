"use client";

import { computeProgressPercent, cn } from "@muziks/utils";

type PlaybackProgressBarProps = {
  progressMs: number;
  durationMs: number;
  paused?: boolean;
  progressUpdatedAt?: number;
  className?: string;
};

export function PlaybackProgressBar({
  progressMs,
  durationMs,
  paused = false,
  progressUpdatedAt,
  className,
}: PlaybackProgressBarProps) {
  const snapshot = {
    positionMs: progressMs,
    durationMs,
    paused,
    positionUpdatedAt: progressUpdatedAt ?? Date.now(),
  };
  const progress = computeProgressPercent(snapshot);

  return (
    <div
      className={cn("h-1 overflow-hidden rounded-full bg-outline/30", className)}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-all",
          paused && "opacity-60",
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
