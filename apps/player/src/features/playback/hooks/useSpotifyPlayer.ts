"use client";

import { useCallback, useEffect, useState } from "react";
import {
  initializeSpotifyPlayer,
  type SpotifyServiceInstance,
} from "../services/SpotifyService";

export type UseSpotifyPlayerState = {
  ready: boolean;
  deviceId: string | null;
  error: string | null;
  trackName: string | null;
  artistName: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

export function useSpotifyPlayer(
  playerName: string,
  enabled: boolean,
): UseSpotifyPlayerState {
  const [service, setService] = useState<SpotifyServiceInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);

  const disconnect = useCallback(() => {
    service?.disconnect();
    setService(null);
    setReady(false);
    setDeviceId(null);
    setTrackName(null);
    setArtistName(null);
  }, [service]);

  const connect = useCallback(async () => {
    setError(null);
    try {
      const instance = await initializeSpotifyPlayer(playerName);
      instance.player.addListener("ready", ({ device_id }) => {
        setReady(true);
        setDeviceId(device_id);
      });
      instance.player.addListener("player_state_changed", (state) => {
        if (!state) return;
        const track = state.track_window.current_track;
        setTrackName(track.name);
        setArtistName(track.artists.map((a) => a.name).join(", "));
      });
      await instance.connect();
      setService(instance);
    } catch (err) {
      setError(err instanceof Error ? err.message : "playback_error");
    }
  }, [playerName]);

  useEffect(() => {
    if (!enabled) {
      disconnect();
    }
  }, [enabled, disconnect]);

  return {
    ready,
    deviceId: deviceId ?? service?.getDeviceId() ?? null,
    error,
    trackName,
    artistName,
    connect,
    disconnect,
  };
}
