import type { DiscoverPlayerCard } from "@muziks/types";
import Link from "next/link";

import { cn } from "@/src/lib/utils";

type DiscoverPlayerCardRowProps = {
  player: DiscoverPlayerCard;
  className?: string;
};

export function DiscoverPlayerCardRow({
  player,
  className,
}: DiscoverPlayerCardRowProps) {
  return (
    <Link
      href={`/${player.slug}`}
      className={cn(
        "flex items-center justify-between rounded-xl border border-outline/30 bg-card/40 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-card/70",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-on-surface">
          {player.displayName}
        </p>
        <p className="truncate text-sm text-on-surface-variant">
          @{player.slug}
        </p>
      </div>
      {player.distanceM != null ? (
        <span className="shrink-0 text-xs text-on-surface-variant">
          ~{player.distanceM} m
        </span>
      ) : null}
    </Link>
  );
}
