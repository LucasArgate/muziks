"use client";

import type {
  NormalizedSpotifyPlaybackQueue,
  PlaybackSyncMode,
} from "@muziks/types";
import { QueueListShell, QueueTrackRow } from "@muziks/ui";

import { useSpotifyPlaybackQueue } from "@/src/features/queue/hooks/useSpotifyPlaybackQueue";

type SpotifyPlaybackQueueListProps = {
  enabled: boolean;
  syncMode: PlaybackSyncMode;
  sdkQueue: NormalizedSpotifyPlaybackQueue | null;
  trackUri: string | null | undefined;
  paused: boolean;
};

export function SpotifyPlaybackQueueList({
  enabled,
  syncMode,
  sdkQueue,
  trackUri,
  paused,
}: SpotifyPlaybackQueueListProps) {
  const useSdkQueue =
    syncMode === "sdk" ||
    (syncMode === "hybrid" && Boolean(sdkQueue?.currentlyPlaying));

  const { queue: polledQueue, loading, error } = useSpotifyPlaybackQueue({
    enabled,
    pollEnabled: !useSdkQueue,
    trackUri,
    pollPlayingMs: 8000,
    pollPausedMs: 20000,
  });

  const queue = useSdkQueue ? sdkQueue : polledQueue;

  const tracks = [
    ...(queue?.currentlyPlaying
      ? [{ ...queue.currentlyPlaying, isCurrent: true }]
      : []),
    ...(queue?.upcoming ?? []).map((track) => ({ ...track, isCurrent: false })),
  ];

  return (
    <QueueListShell
      title="Próximas no Spotify"
      description={
        useSdkQueue
          ? "Próximas faixas a partir do player neste navegador (SDK)."
          : "Espelho da fila nativa do dispositivo Connect (a API do Spotify mostra poucas faixas à frente)."
      }
      loading={!useSdkQueue && loading && !queue}
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
