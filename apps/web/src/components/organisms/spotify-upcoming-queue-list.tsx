"use client";

import { QueueListShell, QueueTrackRow } from "@muziks/ui";

import { usePublicSpotifyQueue } from "@/src/features/queue/hooks/usePublicSpotifyQueue";

type SpotifyUpcomingQueueListProps = {
  slug: string;
};

export function SpotifyUpcomingQueueList({
  slug,
}: SpotifyUpcomingQueueListProps) {
  const { queue, loading, error } = usePublicSpotifyQueue({ slug });
  const tracks = queue?.upcoming.slice(0, 3) ?? [];

  return (
    <QueueListShell
      title="Próximas no Spotify"
      description="Depois da fila da galera, o Spotify já informa estas faixas no dispositivo."
      loading={loading && tracks.length === 0}
      isEmpty={!loading && tracks.length === 0}
      emptyMessage={
        error
          ? "Não foi possível carregar as próximas do Spotify."
          : "O Spotify ainda não informou próximas faixas."
      }
    >
      {tracks.map((track, index) => (
        <QueueTrackRow
          key={`${track.uri}-${index}`}
          title={track.name}
          artist={track.artistName}
          albumImageUrl={track.albumImageUrl}
          positionLabel={String(index + 1)}
          className="transition hover:bg-white/[0.06]"
        />
      ))}
    </QueueListShell>
  );
}
