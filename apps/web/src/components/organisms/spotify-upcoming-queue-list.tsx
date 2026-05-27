"use client";

import { QueueListShell, QueueTrackRow } from "@muziks/ui";

import { usePublicSpotifyQueue } from "@/src/features/queue/hooks/usePublicSpotifyQueue";

type SpotifyUpcomingQueueListProps = {
  slug: string;
  playerId: string;
  transport: "poll" | "realtime";
  trackUri?: string | null;
};

export function SpotifyUpcomingQueueList({
  slug,
  playerId,
  transport,
  trackUri,
}: SpotifyUpcomingQueueListProps) {
  const { queue, loading, error } = usePublicSpotifyQueue({
    slug,
    playerId,
    transport,
    trackUri,
  });

  const upcoming = queue?.upcoming ?? [];
  const currentMatchesHero =
    Boolean(trackUri) &&
    queue?.currentlyPlaying?.uri === trackUri;
  const showCurrentAsFallback =
    upcoming.length === 0 && currentMatchesHero && queue?.currentlyPlaying;

  const tracks = showCurrentAsFallback
    ? [{ ...queue.currentlyPlaying!, isCurrent: true }]
    : upcoming.slice(0, 3).map((track) => ({ ...track, isCurrent: false }));

  return (
    <QueueListShell
      title="Próximas no Spotify"
      description="Depois da fila da galera, o Spotify já informa estas faixas no dispositivo."
      loading={loading && tracks.length === 0}
      isEmpty={!loading && tracks.length === 0}
      emptyMessage={
        error
          ? "Não foi possível carregar as próximas do Spotify."
          : trackUri && !currentMatchesHero
            ? "Atualizando próximas faixas do Spotify..."
          : "O Spotify ainda não informou próximas faixas."
      }
    >
      {tracks.map((track, index) => (
        <QueueTrackRow
          key={`${track.uri}-${index}`}
          title={track.name}
          artist={track.artistName}
          albumImageUrl={track.albumImageUrl}
          positionLabel={track.isCurrent ? "▶" : String(index + 1)}
          highlight={track.isCurrent}
          className="transition hover:bg-white/[0.06]"
        />
      ))}
    </QueueListShell>
  );
}
