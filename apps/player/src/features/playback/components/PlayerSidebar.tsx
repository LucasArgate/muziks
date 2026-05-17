"use client";

import type { NormalizedSpotifyPlayerState } from "@muziks/types";
import { cn } from "@muziks/utils";

import { PlayerBar } from "./PlayerBar";

type PlayerSidebarProps = {
  slug: string;
  playback: NormalizedSpotifyPlayerState | null;
  ready: boolean;
  onTogglePlay: () => void;
  className?: string;
};

const navItems = [
  { label: "Início", active: true, disabled: false },
  { label: "Fila", active: false, disabled: true },
  { label: "Configurações", active: false, disabled: true },
];

export function PlayerSidebar({
  slug,
  playback,
  ready,
  onTogglePlay,
  className,
}: PlayerSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden h-dvh w-60 flex-col border-r border-outline/40 bg-surface/80 md:flex",
        className,
      )}
    >
      <div className="px-5 py-6">
        <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
          Muziks Player
        </p>
        <p className="mt-1 truncate text-lg font-semibold text-on-surface">
          {slug}
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={item.disabled}
            className={cn(
              "w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition",
              item.active
                ? "bg-surface-container-high text-on-surface"
                : "text-on-surface-variant",
              item.disabled && "cursor-not-allowed opacity-40",
            )}
          >
            {item.label}
            {item.disabled ? (
              <span className="ml-2 text-[10px] uppercase">em breve</span>
            ) : null}
          </button>
        ))}
      </nav>

      <div className="mt-auto border-t border-outline/40">
        <PlayerBar
          playback={playback}
          ready={ready}
          onTogglePlay={onTogglePlay}
        />
      </div>
    </aside>
  );
}
