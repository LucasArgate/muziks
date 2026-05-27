"use client";

import type {
  NormalizedSpotifyPlaybackQueue,
  PlaybackSyncMode,
} from "@muziks/types";
import { QueueListShell, QueueTrackRow } from "@muziks/ui";
import { useEffect } from "react";

import { useSpotifyPlaybackQueueRealtime } from "@/src/features/queue/hooks/useSpotifyPlaybackQueueRealtime";

type SpotifyPlaybackQueueListProps = {
  enabled: boolean;
  playerId: string | null | undefined;
  syncMode: PlaybackSyncMode;
  sdkQueue: NormalizedSpotifyPlaybackQueue | null;
  trackUri: string | null | undefined;
  paused: boolean;
};

export function SpotifyPlaybackQueueList({
  enabled,
  playerId,
  syncMode,
  sdkQueue,
  trackUri,
  paused,
}: SpotifyPlaybackQueueListProps) {
  const hasSdkQueueSource = syncMode === "sdk";

  const sdkQueueAligned =
    hasSdkQueueSource &&
    Boolean(trackUri) &&
    sdkQueue?.currentlyPlaying?.uri === trackUri;

  const { queue: polledQueue, loading, error, refresh } =
    useSpotifyPlaybackQueueRealtime({
      enabled,
      playerId,
      pollEnabled: !hasSdkQueueSource || !sdkQueueAligned,
      trackUri,
      pollPlayingMs: 8000,
      pollPausedMs: 20000,
    });

  const queue: NormalizedSpotifyPlaybackQueue | null = sdkQueueAligned
    ? sdkQueue
    : polledQueue;
  const hasPolledQueue = Boolean(polledQueue);

  const listCurrentUri = queue?.currentlyPlaying?.uri ?? null;
  const queueOutOfSync = Boolean(
    trackUri && listCurrentUri && trackUri !== listCurrentUri,
  );
  const showCurrentTrack = Boolean(
    queue?.currentlyPlaying && !queueOutOfSync && trackUri,
  );

  const tracks = [
    ...(showCurrentTrack && queue?.currentlyPlaying
      ? [{ ...queue.currentlyPlaying, isCurrent: true }]
      : []),
    ...(queue?.upcoming ?? []).map((track) => ({ ...track, isCurrent: false })),
  ];

  useEffect(() => {
    if (!enabled || !trackUri) {
      return;
    }
    if (trackUri !== listCurrentUri) {
      void refresh();
    }
  }, [
    enabled,
    error,
    hasSdkQueueSource,
    listCurrentUri,
    loading,
    hasPolledQueue,
    refresh,
    sdkQueueAligned,
    syncMode,
    trackUri,
  ]);

  return (
    <QueueListShell
      title="Próximas no Spotify"
      description={
        sdkQueueAligned
          ? "Próximas faixas a partir do player neste navegador (SDK)."
          : queueOutOfSync
            ? "Atualizando espelho da fila nativa para alinhar com a faixa atual."
          : "Espelho da fila nativa do dispositivo Connect (a API do Spotify mostra poucas faixas à frente)."
      }
      loading={!sdkQueueAligned && loading && !queue}
      isEmpty={!loading && tracks.length === 0}
      emptyMessage={
        error
          ? "Não foi possível carregar a fila do Spotify."
          : queueOutOfSync
            ? "Atualizando fila do Spotify..."
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
