"use client";

import type { CatalogTrack } from "@muziks/types";
import { GlassPanel } from "@muziks/ui";
import { Search } from "lucide-react";
import { useState } from "react";

import { CatalogTrackRow } from "@/src/components/molecules/catalog-track-row";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

type CatalogSearchPanelProps = {
  slug: string;
  onExploreSelect: () => void;
};

export function CatalogSearchPanel({
  slug,
  onExploreSelect,
}: CatalogSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<CatalogTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const search = async () => {
    const q = query.trim();
    if (q.length < 2) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/catalog/search?q=${encodeURIComponent(q)}&slug=${encodeURIComponent(slug)}`,
      );
      const body = (await response.json()) as {
        tracks?: CatalogTrack[];
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setTracks([]);
        setError(body.message ?? body.error ?? "search_failed");
        return;
      }

      setTracks(body.tracks ?? []);
    } catch {
      setError("Não foi possível buscar agora.");
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        O que quer ouvir?
      </Button>
    );
  }

  return (
    <GlassPanel variant="functional" className="space-y-3 p-4">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar música..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void search();
            }
          }}
        />
        <Button type="button" onClick={() => void search()} disabled={loading}>
          Buscar
        </Button>
      </div>

      {error ? (
        <p className="text-sm text-on-surface-variant" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-on-surface-variant">Buscando...</p>
      ) : tracks.length > 0 ? (
        <ul className="max-h-56 space-y-1 overflow-y-auto">
          {tracks.map((track) => (
            <CatalogTrackRow
              key={track.spotifyUri}
              track={track}
              onSelect={onExploreSelect}
            />
          ))}
        </ul>
      ) : query.trim().length >= 2 && !error ? (
        <p className="text-sm text-on-surface-variant">
          Nenhum resultado. Tente outro nome.
        </p>
      ) : null}

      <p className="text-xs text-on-surface-variant">
        Na PoC você pode explorar o catálogo; para votar, escolha uma faixa já na
        fila abaixo.
      </p>
    </GlassPanel>
  );
}
