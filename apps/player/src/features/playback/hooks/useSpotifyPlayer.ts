"use client";

import type { NormalizedSpotifyPlayerState } from "@muziks/types";
import { useCallback, useEffect, useRef, useState } from "react";

import { PlaybackManager } from "../services/PlaybackManager";
import {
  initializeSpotifyPlayer,
  type SpotifyServiceInstance,
} from "../services/SpotifyService";

export type UseSpotifyPlayerState = {
  ready: boolean;
  deviceId: string | null;
  error: string | null;
  playback: NormalizedSpotifyPlayerState | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  togglePlay: () => Promise<void>;
};

export function useSpotifyPlayer(
  playerName: string,
  slug: string,
  enabled: boolean,
  onLocalState: (state: NormalizedSpotifyPlayerState) => void,
  initialPlayback: NormalizedSpotifyPlayerState | null | undefined,
): UseSpotifyPlayerState {
  const [service, setService] = useState<SpotifyServiceInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playback, setPlayback] = useState<NormalizedSpotifyPlayerState | null>(
    initialPlayback ?? null,
  );

  const managerRef = useRef<PlaybackManager | null>(null);
  const onLocalStateRef = useRef(onLocalState);
  onLocalStateRef.current = onLocalState;

  const handleLocalState = useCallback((state: NormalizedSpotifyPlayerState) => {
    setPlayback(state);
    if (state.deviceId) {
      setDeviceId(state.deviceId);
    }
    if (state.status === "ready" || state.status === "playing") {
      setReady(true);
    }
    if (state.status === "idle") {
      setReady(false);
      setDeviceId(null);
    }
    onLocalStateRef.current(state);
  }, []);

  const disconnect = useCallback(() => {
    managerRef.current?.stop();
    managerRef.current = null;
    service?.disconnect();
    setService(null);
    setReady(false);
    setDeviceId(null);
    setError(null);
  }, [service]);

  const connect = useCallback(async () => {
    setError(null);
    try {
      const instance = await initializeSpotifyPlayer(playerName);
      const manager = new PlaybackManager();
      manager.start(instance, { slug, onLocalState: handleLocalState });
      managerRef.current = manager;

      await instance.connect();
      setService(instance);

      const device = instance.getDeviceId();
      if (device) {
        setDeviceId(device);
        setReady(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "playback_error");
    }
  }, [playerName, slug, handleLocalState]);

  const togglePlay = useCallback(async () => {
    const player = managerRef.current?.player ?? service?.player;
    if (!player) return;
    await player.togglePlay();
  }, [service]);

  useEffect(() => {
    if (!enabled) {
      disconnect();
    }
  }, [enabled, disconnect]);

  useEffect(() => {
    if (initialPlayback) {
      setPlayback(initialPlayback);
    }
  }, [initialPlayback]);

  return {
    ready,
    deviceId: deviceId ?? service?.getDeviceId() ?? null,
    error,
    playback,
    connect,
    disconnect,
    togglePlay,
  };
}
