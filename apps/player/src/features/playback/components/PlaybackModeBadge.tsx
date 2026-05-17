import type { PlaybackSyncMode } from "@muziks/types";
import { cn } from "@muziks/utils";

type PlaybackModeBadgeProps = {
  syncMode: PlaybackSyncMode;
  deviceName?: string | null;
  className?: string;
};

const labels: Record<PlaybackSyncMode, string> = {
  api_device: "Spotify Connect",
  sdk: "Navegador",
  hybrid: "Híbrido",
};

export function PlaybackModeBadge({
  syncMode,
  deviceName,
  className,
}: PlaybackModeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
      {labels[syncMode]}
      {deviceName ? (
        <span className="text-on-surface-variant/80">· {deviceName}</span>
      ) : null}
    </span>
  );
}
