"use client";

import { GlassPanel } from "@muziks/ui";
import { cn } from "@muziks/utils";
import type { ReactNode } from "react";

type PlayerMainProps = {
  slug: string;
  spotifyNotice?: string | null;
  error: string | null;
  children: ReactNode;
};

export function PlayerMain({
  slug,
  spotifyNotice,
  error,
  children,
}: PlayerMainProps) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="hidden shrink-0 border-b border-outline/30 px-8 py-4 md:block">
        <h1 className="text-2xl font-semibold text-on-surface">{slug}</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:px-8">
        <div className="w-full max-w-xl">
          <GlassPanel className="p-6 md:p-8">
            {spotifyNotice ? (
              <p
                className={cn(
                  "mb-4 rounded-lg border px-3 py-2 text-center text-sm",
                  "border-outline/60 text-on-surface-variant",
                )}
                role="status"
              >
                {spotifyNotice}
              </p>
            ) : null}

            <div className="space-y-4">{children}</div>

            {error ? (
              <p className="mt-4 text-center text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}

            <p className="mt-6 text-center text-xs text-on-surface-variant">
              Atribuição: conteúdo reproduzido via Spotify
            </p>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

