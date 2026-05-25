import type { CatalogTrack } from "@muziks/types";
import { QueueTrackRow } from "@muziks/ui";
import { Plus } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

type CatalogTrackRowProps = {
  track: CatalogTrack;
  onSelect: () => void;
  className?: string;
};

export function CatalogTrackRow({
  track,
  onSelect,
  className,
}: CatalogTrackRowProps) {
  return (
    <QueueTrackRow
      title={track.title}
      artist={track.artist}
      albumImageUrl={track.albumImageUrl}
      className={cn("transition hover:bg-white/[0.06]", className)}
      trailing={
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-9 w-9 rounded-full border-primary/40 text-primary hover:bg-primary/10"
          onClick={onSelect}
          aria-label={`Escolher ${track.title}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      }
    />
  );
}
