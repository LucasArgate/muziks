import type { ReactNode } from "react";
import { cn } from "@muziks/utils";

export type QueueTrackRowProps = {
  title: string;
  artist: string;
  albumImageUrl?: string | null;
  positionLabel?: string | null;
  highlight?: boolean;
  trailing?: ReactNode;
  className?: string;
};

export function QueueTrackRow({
  title,
  artist,
  albumImageUrl,
  positionLabel,
  highlight = false,
  trailing,
  className,
}: QueueTrackRowProps) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5",
        highlight && "bg-primary/10 ring-1 ring-primary/20",
        className,
      )}
    >
      {positionLabel ? (
        <span className="w-6 shrink-0 text-center text-xs font-medium text-on-surface-variant">
          {positionLabel}
        </span>
      ) : null}
      {albumImageUrl ? (
        <img
          src={albumImageUrl}
          alt=""
          className="h-11 w-11 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-outline/20 text-sm font-semibold text-on-surface-variant"
        >
          {title.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-on-surface">{title}</p>
        <p className="truncate text-xs text-on-surface-variant">{artist}</p>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </li>
  );
}
