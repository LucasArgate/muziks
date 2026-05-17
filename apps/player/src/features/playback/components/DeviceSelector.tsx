"use client";

import type { SpotifyApiDevice } from "@muziks/spotify";
import { useCallback, useEffect, useState } from "react";

type DeviceSelectorProps = {
  onSelect: (deviceId: string, deviceName: string) => Promise<void>;
};

export function DeviceSelector({ onSelect }: DeviceSelectorProps) {
  const [devices, setDevices] = useState<SpotifyApiDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/spotify/playback/devices");
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? "devices_fetch_failed");
      }
      const body = (await response.json()) as { devices: SpotifyApiDevice[] };
      setDevices(body.devices.filter((device) => device.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "devices_error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDevices();
  }, [loadDevices]);

  const handleSelect = async (device: SpotifyApiDevice) => {
    if (!device.id) return;
    setSelectingId(device.id);
    setError(null);
    try {
      await onSelect(device.id, device.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "select_failed");
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-on-surface">
          Escolha onde tocar
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Selecione um dispositivo Spotify Connect. O áudio toca no aparelho
          escolhido; este painel controla a sessão.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-on-surface-variant">Carregando dispositivos…</p>
      ) : null}

      {error ? (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="space-y-2">
        {devices.map((device) => (
          <li key={device.id}>
            <button
              type="button"
              disabled={selectingId !== null}
              onClick={() => void handleSelect(device)}
              className="flex w-full items-center justify-between rounded-xl border border-outline/40 bg-surface-container-low px-4 py-3 text-left transition hover:border-primary/50 disabled:opacity-60"
            >
              <span>
                <span className="block font-medium text-on-surface">
                  {device.name}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {device.type}
                  {device.is_active ? " · ativo agora" : ""}
                </span>
              </span>
              <span className="text-sm font-medium text-primary">
                {selectingId === device.id ? "Conectando…" : "Usar"}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {!loading && devices.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          Nenhum dispositivo encontrado. Abra o Spotify no celular ou desktop e
          tente novamente.
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void loadDevices()}
        className="text-sm text-on-surface-variant underline-offset-2 hover:underline"
      >
        Atualizar lista
      </button>
    </div>
  );
}
