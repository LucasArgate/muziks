"use client";

import { QueueListShell, QueueTrackRow } from "@muziks/ui";

import { useSpotifyPlaybackQueue } from "@/src/features/queue/hooks/useSpotifyPlaybackQueue";

type SpotifyPlaybackQueueListProps = {
  enabled: boolean;
  trackUri: string | null | undefined;
  paused: boolean;
};

export function SpotifyPlaybackQueueList({
  enabled,
  trackUri,
  paused,
}: SpotifyPlaybackQueueListProps) {
  const { queue, loading, error } = useSpotifyPlaybackQueue({
    enabled,
    trackUri,
    pollPlayingMs: 8000,
    pollPausedMs: 20000,
  });

  const tracks = [
    ...(queue?.currentlyPlaying
      ? [{ ...queue.currentlyPlaying, isCurrent: true }]
      : []),
    ...(queue?.upcoming ?? []).map((track) => ({ ...track, isCurrent: false })),
  ];

  return (
    <QueueListShell
      title="Próximas no Spotify"
      description="Espelho da fila nativa do dispositivo Connect (a API do Spotify mostra poucas faixas à frente)."
      loading={loading && !queue}
      isEmpty={!loading && tracks.length === 0}
      emptyMessage={
        error
          ? "Não foi possível carregar a fila do Spotify."
          : paused
            ? "Nada tocando — inicie o playback para ver a fila."
            : "Fila vazia no Spotify."
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
        />
      ))}
    </QueueListShell>
  );
}
