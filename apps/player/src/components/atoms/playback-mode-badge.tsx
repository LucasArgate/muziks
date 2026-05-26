import type { PlaybackSyncMode } from "@muziks/types";
import { cn } from "@muziks/utils";

import { Badge } from "@/src/components/ui/badge";

type PlaybackModeBadgeProps = {
  syncMode: PlaybackSyncMode;
  deviceName?: string | null;
  size?: "default" | "compact";
  className?: string;
};

const labels: Record<PlaybackSyncMode, string> = {
  api_device: "Spotify Connect",
  sdk: "Navegador",
  hybrid: "Spotify Connect",
};

export function PlaybackModeBadge({
  syncMode,
  deviceName,
  size = "default",
  className,
}: PlaybackModeBadgeProps) {
  const compact = size === "compact";

  return (
    <Badge
      variant="secondary"
      className={cn(
        "max-w-full gap-1 font-medium text-on-surface-variant",
        compact
          ? "px-2 py-0.5 text-[10px] leading-tight"
          : "gap-1.5 px-3 py-1 text-xs",
        className,
      )}
    >
      <span
        className={cn(
          "shrink-0 rounded-full bg-primary",
          compact ? "h-1 w-1" : "h-1.5 w-1.5",
        )}
        aria-hidden
      />
      <span className="truncate">{labels[syncMode]}</span>
      {deviceName ? (
        <span className="truncate opacity-80">· {deviceName}</span>
      ) : null}
    </Badge>
  );
}
