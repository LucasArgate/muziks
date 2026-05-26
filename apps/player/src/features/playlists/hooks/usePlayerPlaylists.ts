"use client";

import type {
  ProviderPlaylistSummary,
  SavedProviderPlaylist,
  SavedProviderPlaylistItem,
  SavedProviderPlaylistWithItems,
  SyncProviderPlaylistResult,
} from "@muziks/types";
import { useCallback, useEffect, useMemo, useState } from "react";

type ProviderPlaylistsResponse = {
  playlists: ProviderPlaylistSummary[];
  total: number;
  nextOffset: number | null;
};

type SavedPlaylistsResponse = {
  playlists: SavedProviderPlaylist[];
};

type SavedPlaylistDetailsResponse = {
  playlist: SavedProviderPlaylistWithItems;
};

type ProviderPlaylistSnapshotResponse = {
  playlist: ProviderPlaylistSummary;
  items: Array<
    Pick<
      SavedProviderPlaylistItem,
      | "providerTrackId"
      | "providerTrackUri"
      | "isrc"
      | "title"
      | "artist"
      | "albumImageUrl"
      | "durationMs"
      | "position"
    >
  >;
};

type DefaultPlaylistResponse = {
  playlist: SavedProviderPlaylist | null;
};

type SyncPlaylistsResponse = {
  results: SyncProviderPlaylistResult[];
};

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };
  if (!response.ok) {
    throw new Error(body.error ?? "request_failed");
  }
  return body;
}

export function usePlayerPlaylists(
  slug: string,
  initialDefaultPlaylist: SavedProviderPlaylist | null,
  enabled: boolean,
) {
  const [providerPlaylists, setProviderPlaylists] = useState<
    ProviderPlaylistSummary[]
  >([]);
  const [savedPlaylists, setSavedPlaylists] = useState<SavedProviderPlaylist[]>(
    initialDefaultPlaylist ? [initialDefaultPlaylist] : [],
  );
  const [defaultPlaylist, setDefaultPlaylist] =
    useState<SavedProviderPlaylist | null>(initialDefaultPlaylist);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [syncingIds, setSyncingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const savedByProviderId = useMemo(() => {
    return new Map(
      savedPlaylists.map((playlist) => [
        `${playlist.provider}:${playlist.providerPlaylistId}`,
        playlist,
      ]),
    );
  }, [savedPlaylists]);

  const refreshSaved = useCallback(async () => {
    const response = await fetch(`/api/players/${slug}/playlists`);
    const body = await readJson<SavedPlaylistsResponse>(response);
    setSavedPlaylists(body.playlists);
    setDefaultPlaylist(
      body.playlists.find((playlist) => playlist.isDefault) ?? null,
    );
  }, [slug]);

  const refreshProvider = useCallback(async () => {
    const response = await fetch(`/api/players/${slug}/playlists/provider`);
    const body = await readJson<ProviderPlaylistsResponse>(response);
    setProviderPlaylists(body.playlists);
    setNextOffset(body.nextOffset);
  }, [slug]);

  const refreshAll = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await Promise.all([refreshSaved(), refreshProvider()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "playlists_load_error");
    } finally {
      setLoading(false);
    }
  }, [enabled, refreshProvider, refreshSaved]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  const loadMore = useCallback(async () => {
    if (nextOffset === null) {
      return;
    }

    setLoadingMore(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/players/${slug}/playlists/provider?offset=${nextOffset}`,
      );
      const body = await readJson<ProviderPlaylistsResponse>(response);
      setProviderPlaylists((current) => [...current, ...body.playlists]);
      setNextOffset(body.nextOffset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "playlists_load_error");
    } finally {
      setLoadingMore(false);
    }
  }, [nextOffset, slug]);

  const syncPlaylists = useCallback(
    async (providerPlaylistIds: string[]) => {
      if (providerPlaylistIds.length === 0) {
        return [];
      }

      setSyncingIds((current) => [
        ...new Set([...current, ...providerPlaylistIds]),
      ]);
      setError(null);
      try {
        const response = await fetch(`/api/players/${slug}/playlists/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: "spotify",
            providerPlaylistIds,
          }),
        });
        const body = await readJson<SyncPlaylistsResponse>(response);
        await refreshSaved();
        return body.results;
      } catch (err) {
        setError(err instanceof Error ? err.message : "playlist_sync_error");
        return [];
      } finally {
        setSyncingIds((current) =>
          current.filter((id) => !providerPlaylistIds.includes(id)),
        );
      }
    },
    [refreshSaved, slug],
  );

  const chooseDefaultPlaylist = useCallback(
    async (playlistId: string) => {
      setError(null);
      const response = await fetch(`/api/players/${slug}/playlists/default`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistId }),
      });
      const body = await readJson<DefaultPlaylistResponse>(response);
      setDefaultPlaylist(body.playlist);
      setSavedPlaylists((current) =>
        current.map((playlist) => ({
          ...playlist,
          isDefault: playlist.id === body.playlist?.id,
        })),
      );
      return body.playlist;
    },
    [slug],
  );

  const loadSavedPlaylistDetails = useCallback(
    async (playlistId: string) => {
      const response = await fetch(
        `/api/players/${slug}/playlists?playlistId=${encodeURIComponent(
          playlistId,
        )}`,
      );
      const body = await readJson<SavedPlaylistDetailsResponse>(response);
      return body.playlist;
    },
    [slug],
  );

  const loadProviderPlaylistSnapshot = useCallback(
    async (providerPlaylistId: string) => {
      const response = await fetch(
        `/api/players/${slug}/playlists/provider?providerPlaylistId=${encodeURIComponent(
          providerPlaylistId,
        )}`,
      );
      return readJson<ProviderPlaylistSnapshotResponse>(response);
    },
    [slug],
  );

  return {
    providerPlaylists,
    savedPlaylists,
    savedByProviderId,
    defaultPlaylist,
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
  };
}
