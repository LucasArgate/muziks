"use client";

import type { NormalizedSpotifyPlayerState } from "@muziks/types";
import { cn } from "@muziks/utils";

type PlayerBarProps = {
  playback: NormalizedSpotifyPlayerState | null;
  ready: boolean;
  onTogglePlay: () => void;
  className?: string;
};

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PlayerBar({
  playback,
  ready,
  onTogglePlay,
  className,
}: PlayerBarProps) {
  const progress =
    playback && playback.durationMs > 0
      ? Math.min(100, (playback.positionMs / playback.durationMs) * 100)
      : 0;

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center gap-3">
        {playback?.albumImageUrl ? (
          <img
            src={playback.albumImageUrl}
            alt=""
            className="h-12 w-12 shrink-0 rounded-md object-cover"
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
          {playback && playback.durationMs > 0 ? (
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-outline/30">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onTogglePlay}
          disabled={!ready}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary transition",
            "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40",
          )}
          aria-label={playback?.paused !== false ? "Reproduzir" : "Pausar"}
        >
          {playback?.paused !== false ? <PlayIcon /> : <PauseIcon />}
        </button>
      </div>

      {playback && playback.durationMs > 0 ? (
        <p className="mt-1 text-right text-[10px] tabular-nums text-on-surface-variant">
          {formatTime(playback.positionMs)} / {formatTime(playback.durationMs)}
        </p>
      ) : null}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
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

