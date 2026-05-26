"use client";

import type {
  ProviderPlaylistSummary,
  SavedProviderPlaylist,
  SavedProviderPlaylistItem,
} from "@muziks/types";
import { ChevronDown, Loader2, Play, Plus, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { usePlayerPlaylists } from "@/src/features/playlists/hooks/usePlayerPlaylists";

type PlayerPlaylistsViewProps = {
  slug: string;
  defaultPlaylist: SavedProviderPlaylist | null;
  playbackReady: boolean;
  playbackLoading: boolean;
  onPlayPlaylist: (providerUri: string) => void | Promise<void>;
};

type PlaylistTrackPreview = Pick<
  SavedProviderPlaylistItem,
  | "providerTrackId"
  | "providerTrackUri"
  | "isrc"
  | "title"
  | "artist"
  | "albumImageUrl"
  | "durationMs"
  | "position"
>;

function formatSyncDate(value: string | null): string {
  if (!value) {
    return "Ainda não sincronizada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PlayerPlaylistsView({
  slug,
  defaultPlaylist,
  playbackReady,
  playbackLoading,
  onPlayPlaylist,
}: PlayerPlaylistsViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [expandedProviderPlaylistId, setExpandedProviderPlaylistId] =
    useState<string | null>(null);
  const [tracksByProviderPlaylistId, setTracksByProviderPlaylistId] = useState<
    Record<string, PlaylistTrackPreview[]>
  >({});
  const [loadingTracksId, setLoadingTracksId] = useState<string | null>(null);
  const {
    providerPlaylists,
    savedByProviderId,
    defaultPlaylist: currentDefault,
    loading,
    loadingMore,
    syncingIds,
    error,
    nextOffset,
    refreshAll,
    loadMore,
    syncPlaylists,
    chooseDefaultPlaylist,
    loadSavedPlaylistDetails,
    loadProviderPlaylistSnapshot,
  } = usePlayerPlaylists(slug, defaultPlaylist, true);

  const selectedCount = selectedIds.length;
  const anySyncing = syncingIds.length > 0;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const displayError =
    error === "spotify_api_403"
      ? "Reconecte o Spotify para autorizar a leitura das suas playlists."
      : error;

  function toggleSelected(providerPlaylistId: string) {
    setSelectedIds((current) =>
      current.includes(providerPlaylistId)
        ? current.filter((id) => id !== providerPlaylistId)
        : [...current, providerPlaylistId],
    );
  }

  function clearTrackPreview(providerPlaylistIds: string[]) {
    setTracksByProviderPlaylistId((current) => {
      const next = { ...current };
      for (const providerPlaylistId of providerPlaylistIds) {
        delete next[providerPlaylistId];
      }
      return next;
    });
  }

  async function syncSelected() {
    const results = await syncPlaylists(selectedIds);
    const syncedCount = results.filter((result) => !result.error).length;
    setLastAction(`${syncedCount} playlist(s) sincronizada(s).`);
    clearTrackPreview(selectedIds);
    setSelectedIds([]);
  }

  async function syncOne(providerPlaylistId: string) {
    const results = await syncPlaylists([providerPlaylistId]);
    const result = results[0];
    if (result?.playlist && !result.error) {
      setLastAction(
        result.skipped
          ? "Playlist já estava atualizada."
          : "Playlist sincronizada.",
      );
      clearTrackPreview([providerPlaylistId]);
    }
  }

  async function setAsDefault(playlistId: string) {
    await chooseDefaultPlaylist(playlistId);
    setLastAction("Playlist padrão atualizada.");
  }

  async function playPlaylist(providerUri: string) {
    await onPlayPlaylist(providerUri);
    setLastAction("Reproduzindo playlist.");
  }

  async function togglePlaylistTracks(
    playlist: ProviderPlaylistSummary,
    saved: SavedProviderPlaylist | undefined,
  ) {
    const providerPlaylistId = playlist.providerPlaylistId;
    if (expandedProviderPlaylistId === providerPlaylistId) {
      setExpandedProviderPlaylistId(null);
      return;
    }

    setExpandedProviderPlaylistId(providerPlaylistId);
    if (tracksByProviderPlaylistId[providerPlaylistId]) {
      return;
    }

    setLoadingTracksId(providerPlaylistId);
    setLastAction(null);
    try {
      const items = saved
        ? (await loadSavedPlaylistDetails(saved.id)).items
        : (await loadProviderPlaylistSnapshot(providerPlaylistId)).items;
      setTracksByProviderPlaylistId((current) => ({
        ...current,
        [providerPlaylistId]: items,
      }));
    } catch (err) {
      setLastAction(
        err instanceof Error
          ? `Não foi possível carregar músicas: ${err.message}`
          : "Não foi possível carregar músicas.",
      );
      setExpandedProviderPlaylistId(null);
    } finally {
      setLoadingTracksId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-on-surface">Playlists</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Salve playlists do Spotify no Muziks e escolha a playlist inicial.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void refreshAll()}
            disabled={loading || anySyncing}
          >
            Atualizar lista
          </Button>
          <Button
            type="button"
            onClick={() => void syncSelected()}
            disabled={selectedCount === 0 || anySyncing}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Selecionadas ({selectedCount})
          </Button>
        </div>
      </div>

      {currentDefault ? (
        <Card className="border-primary/40 bg-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-on-surface">
              Playlist padrão
            </CardTitle>
            <CardDescription>
              Toca quando o Player Master iniciar ou quando você apertar play
              sem faixa.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-on-surface">
            <span className="font-medium">{currentDefault.name}</span>
            <span className="text-on-surface-variant">
              {" "}
              · {currentDefault.tracksTotal} faixas · sync{" "}
              {formatSyncDate(currentDefault.lastSyncedAt)}
            </span>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-outline/40 bg-surface-container/50">
          <CardContent className="py-4 text-sm text-on-surface-variant">
            Nenhuma playlist padrão definida.
          </CardContent>
        </Card>
      )}

      {(displayError || lastAction) && (
        <p className="rounded-lg border border-outline/40 bg-surface-container/50 px-4 py-3 text-sm text-on-surface-variant">
          {displayError ? `Erro: ${displayError}` : lastAction}
        </p>
      )}

      <div className="space-y-3">
        {loading && providerPlaylists.length === 0 ? (
          <p className="rounded-lg border border-dashed border-outline/50 px-4 py-6 text-center text-sm text-on-surface-variant">
            Carregando playlists do Spotify...
          </p>
        ) : null}

        {!loading && providerPlaylists.length === 0 ? (
          <p className="rounded-lg border border-dashed border-outline/50 px-4 py-6 text-center text-sm text-on-surface-variant">
            Nenhuma playlist encontrada no Spotify.
          </p>
        ) : null}

        {providerPlaylists.map((playlist) => {
          const saved = savedByProviderId.get(
            `${playlist.provider}:${playlist.providerPlaylistId}`,
          );
          const isDefault = Boolean(
            saved && currentDefault && saved.id === currentDefault.id,
          );
          const syncing = syncingIds.includes(playlist.providerPlaylistId);
          const selected = selectedSet.has(playlist.providerPlaylistId);
          const expanded =
            expandedProviderPlaylistId === playlist.providerPlaylistId;
          const loadingTracks = loadingTracksId === playlist.providerPlaylistId;
          const tracks = tracksByProviderPlaylistId[playlist.providerPlaylistId];

          return (
            <Card
              key={playlist.providerPlaylistId}
              className="border-outline/40 bg-surface-container/50"
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <label className="mt-3 flex h-5 w-5 shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-primary"
                      checked={selected}
                      onChange={() =>
                        toggleSelected(playlist.providerPlaylistId)
                      }
                      aria-label={`Selecionar ${playlist.name}`}
                    />
                  </label>

                  <div
                    className="h-14 w-14 shrink-0 rounded-xl border border-outline/40 bg-cover bg-center bg-surface"
                    style={
                      playlist.imageUrl
                        ? { backgroundImage: `url(${playlist.imageUrl})` }
                        : undefined
                    }
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="min-w-0 text-base font-semibold">
                        <button
                          type="button"
                          className="flex min-w-0 items-center gap-1 text-left text-on-surface transition hover:text-primary"
                          aria-expanded={expanded}
                          onClick={() =>
                            void togglePlaylistTracks(playlist, saved)
                          }
                        >
                          <span className="truncate">{playlist.name}</span>
                          <ChevronDown
                            className={`h-4 w-4 shrink-0 transition-transform ${
                              expanded ? "rotate-180" : ""
                            }`}
                            aria-hidden
                          />
                        </button>
                      </h2>
                      {saved ? <Badge variant="secondary">Salva</Badge> : null}
                      {isDefault ? <Badge>Padrão</Badge> : null}
                    </div>
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {playlist.tracksTotal} faixas
                      {playlist.ownerName ? ` · ${playlist.ownerName}` : ""}
                    </p>
                    {saved ? (
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Último sync: {formatSyncDate(saved.lastSyncedAt)}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      disabled={!playbackReady || playbackLoading}
                      onClick={() => void playPlaylist(playlist.providerUri)}
                      aria-label={`Tocar ${playlist.name}`}
                    >
                      {playbackLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <Play className="h-4 w-4 fill-current" aria-hidden />
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant={saved ? "outline" : "default"}
                      size="icon"
                      className="h-9 w-9 rounded-full"
                      disabled={syncing}
                      onClick={() => void syncOne(playlist.providerPlaylistId)}
                      aria-label={
                        saved
                          ? `Atualizar ${playlist.name}`
                          : `Adicionar ${playlist.name}`
                      }
                    >
                      {syncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : saved ? (
                        <RefreshCw className="h-4 w-4" aria-hidden />
                      ) : (
                        <Plus className="h-4 w-4" aria-hidden />
                      )}
                    </Button>
                    {saved && !isDefault ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void setAsDefault(saved.id)}
                      >
                        Definir padrão
                      </Button>
                    ) : null}
                  </div>
                </div>
                {expanded ? (
                  <div className="mt-4 rounded-xl border border-outline/30 bg-surface/50 p-3">
                    {loadingTracks ? (
                      <p className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        Carregando músicas...
                      </p>
                    ) : tracks?.length ? (
                      <ol className="space-y-2">
                        {tracks.map((track) => (
                          <li
                            key={track.providerTrackUri}
                            className="flex items-center gap-3 text-sm"
                          >
                            <div
                              className="h-9 w-9 shrink-0 rounded-md bg-cover bg-center bg-surface-container-high"
                              style={
                                track.albumImageUrl
                                  ? {
                                      backgroundImage: `url(${track.albumImageUrl})`,
                                    }
                                  : undefined
                              }
                              aria-hidden="true"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-on-surface">
                                {track.title}
                              </p>
                              <p className="truncate text-xs text-on-surface-variant">
                                {track.artist}
                              </p>
                            </div>
                            {track.durationMs > 0 ? (
                              <span className="shrink-0 text-xs tabular-nums text-on-surface-variant">
                                {formatDuration(track.durationMs)}
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="text-sm text-on-surface-variant">
                        Nenhuma música disponível nesta playlist.
                      </p>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {nextOffset !== null ? (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loadingMore}
          onClick={() => void loadMore()}
        >
          {loadingMore ? "Carregando..." : "Carregar mais playlists"}
        </Button>
      ) : null}
    </div>
  );
}
