"use client";

import type { PublicPlaybackSession } from "@muziks/types";
import { GlassPanel } from "@muziks/ui";
import { cn } from "@muziks/utils";

type PlayerHeroProps = {
  displayName: string;
  session: PublicPlaybackSession | null;
  loading?: boolean;
};

export function PlayerHero({
  displayName,
  session,
  loading = false,
}: PlayerHeroProps) {
  const progress =
    session && session.durationMs > 0
      ? Math.min(100, (session.progressMs / session.durationMs) * 100)
      : 0;

  return (
    <GlassPanel className="relative overflow-hidden p-6">
      {session?.albumImageUrl ? (
        <img
          src={session.albumImageUrl}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 blur-sm"
        />
      ) : null}
      <div className="relative z-10 space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
          {displayName}
        </p>
        {loading ? (
          <div className="h-16 animate-pulse rounded-lg bg-outline/20" aria-hidden />
        ) : session?.trackName ? (
          <>
            <div className="flex items-center gap-4">
              {session.albumImageUrl ? (
                <img
                  src={session.albumImageUrl}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-xl object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-outline/25 text-2xl font-semibold text-on-surface-variant">
                  ♪
                </div>
              )}
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold text-on-surface">
                  {session.trackName}
                </h1>
                <p className="truncate text-sm text-on-surface-variant">
                  {session.artistName ?? "—"}
                </p>
              </motion>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-outline/30">
              <div
                className={cn(
                  "h-full rounded-full bg-primary transition-all",
                  session.paused && "opacity-60",
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-on-surface-variant">
              {session.paused ? "Pausado" : "Tocando agora"}
            </p>
          </>
        ) : (
          <p className="text-sm text-on-surface-variant">
            Nada tocando no momento — a fila continua viva.
          </p>
        )}
      </div>
    </GlassPanel>
  );
}
