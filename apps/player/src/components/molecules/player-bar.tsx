"use client";

import type {
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
} from "@muziks/types";
import { cn } from "@muziks/utils";
import { Loader2, Pause, Play, SkipForward } from "lucide-react";

import { ConnectDeviceControl } from "@/src/components/molecules/connect-device-control";
import { Button } from "@/src/components/ui/button";
import { hasActivePlayback } from "@/src/features/playback/lib/playback-control-routing";
import { usePlaybackProgress } from "@/src/features/playback/hooks/usePlaybackProgress";

type PlayerBarProps = {
  playback: NormalizedSpotifyPlayerState | null;
  ready: boolean;
  canStartPlayback?: boolean;
  playPauseLoading?: boolean;
  skipLoading?: boolean;
  onTogglePlay: () => void | Promise<void>;
  onSkipNext: () => void | Promise<void>;
  syncMode?: PlaybackSyncMode;
  deviceName?: string | null;
  showConnectBadge?: boolean;
  onSelectDevice?: (deviceId: string, deviceName: string) => Promise<void>;
  className?: string;
};

export function PlayerBar({
  playback,
  ready,
  canStartPlayback = false,
  playPauseLoading = false,
  skipLoading = false,
  onTogglePlay,
  onSkipNext,
  syncMode,
  deviceName,
  showConnectBadge = false,
  onSelectDevice,
  className,
}: PlayerBarProps) {
  const progress = usePlaybackProgress(playback);
  const canControl = hasActivePlayback(playback);
  const canUsePlayPause = canControl || canStartPlayback;
  const willStartDefault = canStartPlayback && !playback?.trackUri;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="p-3">
        <div className="flex items-center gap-3">
          {playback?.albumImageUrl ? (
            <div
              className="h-12 w-12 shrink-0 rounded-md bg-cover bg-center"
              style={{ backgroundImage: `url(${playback.albumImageUrl})` }}
              aria-hidden="true"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-container-high text-on-surface-variant">
              <MusicIcon />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-on-surface">
              {playback?.trackName ?? "Nenhuma faixa"}
            </p>
            <p className="truncate text-xs text-on-surface-variant">
              {playback?.artistName ?? (ready ? "Pronto para reproduzir" : "—")}
            </p>
            {progress.hasDuration ? (
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-outline/30">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => void onTogglePlay()}
              disabled={
                !ready || !canUsePlayPause || playPauseLoading || skipLoading
              }
              className="h-8 w-8 rounded-full"
              aria-label={
                playback?.paused !== false
                  ? willStartDefault
                    ? "Reproduzir playlist padrão"
                    : "Reproduzir"
                  : "Pausar"
              }
            >
              {playPauseLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : playback?.paused !== false ? (
                <Play className="h-4 w-4 fill-current" />
              ) : (
                <Pause className="h-4 w-4 fill-current" />
              )}
            </Button>

            <Button
              type="button"
              size="icon"
              onClick={() => void onSkipNext()}
              disabled={!ready || !canControl || playPauseLoading || skipLoading}
              className="h-11 w-11 rounded-full"
              aria-label="Próxima faixa"
            >
              {skipLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <SkipForward className="h-5 w-5 fill-current" />
              )}
            </Button>
          </div>
        </div>

        {progress.hasDuration ? (
          <p className="mt-1 text-right text-[10px] tabular-nums text-on-surface-variant">
            {progress.currentTime} / {progress.durationTime}
          </p>
        ) : null}
      </div>

      {showConnectBadge && syncMode && onSelectDevice ? (
        <div className="border-t border-outline/40 px-3 py-2">
          <ConnectDeviceControl
            syncMode={syncMode}
            deviceName={deviceName}
            onSelectDevice={onSelectDevice}
          />
        </div>
      ) : null}
    </div>
  );
}

function MusicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-current"
      fill="none"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
