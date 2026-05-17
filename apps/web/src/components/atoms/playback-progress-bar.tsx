import { cn } from "@muziks/utils";

type PlaybackProgressBarProps = {
  progressMs: number;
  durationMs: number;
  paused?: boolean;
  className?: string;
};

export function PlaybackProgressBar({
  progressMs,
  durationMs,
  paused = false,
  className,
}: PlaybackProgressBarProps) {
  const progress =
    durationMs > 0 ? Math.min(100, (progressMs / durationMs) * 100) : 0;

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
