"use client";

import type {
  CatalogArtist,
  CatalogArtistTracks,
  CatalogSearchResult,
  CatalogTrack,
} from "@muziks/types";
import { GlassPanel, glassHoverClass } from "@muziks/ui";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { CatalogTrackRow } from "@/src/components/molecules/catalog-track-row";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { cn } from "@muziks/utils";

type CatalogSearchPanelProps = {
  slug: string;
  onExploreSelect: () => void;
};

type CatalogArtistRowProps = {
  artist: CatalogArtist;
};

type ResultSectionProps = {
  title: string;
  emptyMessage: string;
  children: ReactNode;
  isEmpty: boolean;
};

function ResultSection({
  title,
  emptyMessage,
  children,
  isEmpty,
}: ResultSectionProps) {
  return (
    <section className="space-y-2">
      <h3 className="px-1 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant/80">
        {title}
      </h3>
      {isEmpty ? (
        <p className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-4 text-sm text-on-surface-variant">
          {emptyMessage}
        </p>
      ) : (
        children
      )}
    </section>
  );
}

function CatalogArtistRow({ artist }: CatalogArtistRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.06]">
      {artist.imageUrl ? (
        <span
          aria-hidden
          className="h-11 w-11 shrink-0 rounded-full bg-cover bg-center"
          style={{ backgroundImage: `url(${artist.imageUrl})` }}
        />
      ) : (
        <span
          aria-hidden
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-outline/20 text-sm font-semibold text-on-surface-variant"
        >
          {artist.name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-on-surface">
          {artist.name}
        </p>
        <p className="truncate text-xs text-on-surface-variant">
          Artista encontrado
        </p>
      </div>
      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        Artista
      </span>
    </li>
  );
}

function ArtistTracksGroup({
  group,
  onSelect,
}: {
  group: CatalogArtistTracks;
  onSelect: () => void;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2">
      <div className="flex items-center gap-2 px-1">
        {group.artist.imageUrl ? (
          <span
            aria-hidden
            className="h-7 w-7 shrink-0 rounded-full bg-cover bg-center"
            style={{ backgroundImage: `url(${group.artist.imageUrl})` }}
          />
        ) : (
          <span
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-outline/20 text-xs font-semibold text-on-surface-variant"
          >
            {group.artist.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <p className="truncate text-sm font-medium text-on-surface">
          Músicas de {group.artist.name}
        </p>
      </div>
      <ul className="space-y-1">
        {group.tracks.map((track) => (
          <CatalogTrackRow
            key={`${group.artist.spotifyId}-${track.spotifyUri}`}
            track={track}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  );
}

export function CatalogSearchPanel({
  slug,
  onExploreSelect,
}: CatalogSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<CatalogSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const tracks: CatalogTrack[] = result?.tracks ?? [];
  const artists: CatalogArtist[] = result?.artists ?? [];
  const artistTracks: CatalogArtistTracks[] = result?.artistTracks ?? [];
  const hasSearched = Boolean(result) || Boolean(error);

  const search = async (nextQuery = query) => {
    const q = nextQuery.trim();
    if (q.length < 2) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/catalog/search?q=${encodeURIComponent(q)}&slug=${encodeURIComponent(slug)}`,
      );
      const body = (await response.json()) as CatalogSearchResult & {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setResult(null);
        setError(body.message ?? body.error ?? "search_failed");
        return;
      }

      setResult({
        tracks: body.tracks ?? [],
        artists: body.artists ?? [],
        artistTracks: body.artistTracks ?? [],
      });
    } catch {
      setError("Não foi possível buscar agora.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-14 w-full rounded-2xl border-white/[0.12] bg-black/30 text-base font-semibold",
            glassHoverClass,
          )}
        >
          <Search className="h-5 w-5" />
          O que quer ouvir?
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[min(88vh,760px)] w-[calc(100vw-1.5rem)] max-w-lg border-0 bg-transparent p-0 shadow-none sm:rounded-[2rem]">
        <GlassPanel
          variant="functional"
          radius="lg"
          className="flex h-full flex-col overflow-hidden p-4"
        >
          <DialogHeader className="pr-8 text-left">
            <DialogTitle className="text-xl">Buscar no Spotify</DialogTitle>
            <p className="text-sm text-on-surface-variant">
              Encontre músicas, artistas e faixas relacionadas ao artista.
            </p>
          </DialogHeader>

          <form
            className="mt-4 flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void search();
            }}
          >
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nome da música ou artista"
                className="h-12 rounded-2xl border-white/[0.12] bg-black/40 pl-10 text-base text-on-surface placeholder:text-on-surface-variant focus-visible:ring-primary"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="h-12 rounded-2xl px-5"
              disabled={loading || query.trim().length < 2}
            >
              Buscar
            </Button>
          </form>

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
            {error ? (
              <p
                className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-4 text-sm text-on-surface-variant"
                role="alert"
              >
                {error}
              </p>
            ) : null}

            {loading ? (
              <p className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-4 text-sm text-on-surface-variant">
                Buscando...
              </p>
            ) : null}

            {!loading && hasSearched && !error ? (
              <div className="space-y-5">
                <ResultSection
                  title="Músicas"
                  emptyMessage="Nenhuma música encontrada."
                  isEmpty={tracks.length === 0}
                >
                  <ul className="space-y-1">
                    {tracks.map((track) => (
                      <CatalogTrackRow
                        key={track.spotifyUri}
                        track={track}
                        onSelect={onExploreSelect}
                      />
                    ))}
                  </ul>
                </ResultSection>

                <ResultSection
                  title="Artistas"
                  emptyMessage="Nenhum artista encontrado."
                  isEmpty={artists.length === 0}
                >
                  <ul className="space-y-1">
                    {artists.map((artist) => (
                      <CatalogArtistRow
                        key={artist.spotifyId}
                        artist={artist}
                      />
                    ))}
                  </ul>
                </ResultSection>

                <ResultSection
                  title="Músicas dos artistas"
                  emptyMessage="Nenhuma faixa relacionada aos artistas encontrados."
                  isEmpty={artistTracks.length === 0}
                >
                  <div className="space-y-3">
                    {artistTracks.map((group) => (
                      <ArtistTracksGroup
                        key={group.artist.spotifyId}
                        group={group}
                        onSelect={onExploreSelect}
                      />
                    ))}
                  </div>
                </ResultSection>
              </div>
            ) : null}

            {!loading && !hasSearched ? (
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-4 text-sm text-on-surface-variant">
                Digite pelo menos 2 letras para explorar o catálogo do espaço.
              </div>
            ) : null}
          </div>

          <p className="mt-3 text-xs text-on-surface-variant">
            Na PoC você pode explorar o catálogo; para votar, escolha uma faixa
            já na fila abaixo.
          </p>
        </GlassPanel>
      </DialogContent>
    </Dialog>
  );
}
