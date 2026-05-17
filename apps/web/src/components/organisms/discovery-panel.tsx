"use client";

import type { DiscoverPlayerCard } from "@muziks/types";
import { GlassPanel, MuziksLogo } from "@muziks/ui";
import { MapPin } from "lucide-react";
import { useState } from "react";

import { CreatePlayerLink } from "@/src/components/molecules/create-player-link";
import { DiscoverPlayerCardRow } from "@/src/components/molecules/discover-player-card";
import { DiscoverySearchField } from "@/src/components/molecules/discovery-search-field";
import { Button } from "@/src/components/ui/button";

type GeoState = "idle" | "loading" | "denied" | "error";

export function DiscoveryPanel() {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState<DiscoverPlayerCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [geoState, setGeoState] = useState<GeoState>("idle");

  const fetchPlayers = async (url: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch(url);
      const body = (await response.json()) as {
        players?: DiscoverPlayerCard[];
        error?: string;
      };
      if (!response.ok) {
        setPlayers([]);
        setMessage(body.error ?? "discover_failed");
        return;
      }
      const list = body.players ?? [];
      setPlayers(list);
      if (list.length === 0) {
        setMessage("Nenhum espaço encontrado. Tente outro nome ou peça o link na recepção.");
      }
    } catch {
      setPlayers([]);
      setMessage("Não foi possível buscar agora. Tente de novo.");
    } finally {
      setLoading(false);
    }
  };

  const searchByName = () => {
    const q = query.trim();
    if (!q) {
      return;
    }
    void fetchPlayers(`/api/discover/players?q=${encodeURIComponent(q)}`);
  };

  const searchByGeo = () => {
    if (!navigator.geolocation) {
      setGeoState("error");
      setMessage("Seu navegador não suporta localização. Use a busca por nome.");
      return;
    }

    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoState("idle");
        void fetchPlayers(
          `/api/discover/players?lat=${position.coords.latitude}&lng=${position.coords.longitude}`,
        );
      },
      () => {
        setGeoState("denied");
        setMessage(
          "Podemos usar sua localização para achar players perto de você. Se preferir não, use o link ou o nome do espaço.",
        );
      },
      { enableHighAccuracy: false, timeout: 12_000 },
    );
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 py-10">
      <header className="flex flex-col items-center gap-3 text-center">
        <MuziksLogo className="h-10 w-auto" />
        <h1 className="text-2xl font-semibold text-on-surface">
          Encontre um espaço
        </h1>
        <p className="text-sm text-on-surface-variant">
          Busque pelo nome ou use sua localização para ver players por perto.
        </p>
        <CreatePlayerLink />
      </header>

      <GlassPanel variant="functional" className="space-y-4 p-4">
        <DiscoverySearchField
          value={query}
          onChange={setQuery}
          onSubmit={searchByName}
          disabled={loading}
        />

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={searchByGeo}
          disabled={loading || geoState === "loading"}
        >
          <MapPin className="h-4 w-4" />
          {geoState === "loading"
            ? "Obtendo localização..."
            : "Usar minha localização"}
        </Button>
      </GlassPanel>

      {message ? (
        <p className="text-center text-sm text-on-surface-variant" role="status">
          {message}
        </p>
      ) : null}

      {players.length > 0 ? (
        <ul className="space-y-2">
          {players.map((player) => (
            <li key={player.id}>
              <DiscoverPlayerCardRow player={player} />
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
