import type { CatalogTrack } from "@muziks/types";

import { Button } from "@/src/components/ui/button";

type CatalogTrackRowProps = {
  track: CatalogTrack;
  onSelect: () => void;
};

export function CatalogTrackRow({ track, onSelect }: CatalogTrackRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-outline/10">
      {track.albumImageUrl ? (
        <img
          src={track.albumImageUrl}
          alt=""
          className="h-10 w-10 shrink-0 rounded-md object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-outline/20 text-xs text-on-surface-variant"
        >
          ♪
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-on-surface">
          {track.title}
        </p>
        <p className="truncate text-xs text-on-surface-variant">
          {track.artist}
        </p>
      </div>
      <Button type="button" size="sm" variant="secondary" onClick={onSelect}>
        Escolher
      </Button>
    </li>
  );
}
