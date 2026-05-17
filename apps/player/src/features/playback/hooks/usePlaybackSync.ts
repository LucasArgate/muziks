"use client";

import type {
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
  PlayerMasterSessionMeta,
} from "@muziks/types";
import { useCallback, useEffect, useRef, useState } from "react";

import { PlaybackSyncCoordinator } from "../services/playback-sync-coordinator";
import { initializeSpotifyPlayer } from "../services/SpotifyService";

export type UsePlaybackSyncOptions = {
  slug: string;
  playerName: string;
  enabled: boolean;
  sessionMeta: PlayerMasterSessionMeta | null | undefined;
  initialPlayback: NormalizedSpotifyPlayerState | null | undefined;
  onLocalState: (state: NormalizedSpotifyPlayerState) => void;
};

export function usePlaybackSync({
  slug,
  playerName,
  enabled,
  sessionMeta,
  initialPlayback,
  onLocalState,
}: UsePlaybackSyncOptions) {
  const [playback, setPlayback] = useState<NormalizedSpotifyPlayerState | null>(
    initialPlayback ?? null,
  );
  const [syncMode, setSyncMode] = useState<PlaybackSyncMode>(
    sessionMeta?.syncMode ?? "api_device",
  );
  const [preferredDeviceId, setPreferredDeviceId] = useState<string | null>(
    sessionMeta?.preferredDeviceId ?? null,
  );
  const [activeDeviceName, setActiveDeviceName] = useState<string | null>(
    sessionMeta?.activeDeviceName ?? null,
  );
  const [stateVersion, setStateVersion] = useState(
    sessionMeta?.stateVersion ?? 0,
  );
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);

  const coordinatorRef = useRef<PlaybackSyncCoordinator | null>(null);
  const onLocalStateRef = useRef(onLocalState);
  onLocalStateRef.current = onLocalState;

  const handleLocalState = useCallback((state: NormalizedSpotifyPlayerState) => {
    setPlayback(state);
    if (state.status === "ready" || state.status === "playing") {
      setSdkReady(true);
    }
    if (state.status === "idle") {
      setSdkReady(false);
    }
    onLocalStateRef.current(state);
  }, []);

  useEffect(() => {
    if (!enabled) {
      coordinatorRef.current?.stop();
      coordinatorRef.current = null;
      setSdkReady(false);
      return;
    }

    const coordinator = new PlaybackSyncCoordinator();
    coordinatorRef.current = coordinator;
    coordinator.configure({
      slug,
      sessionMeta: sessionMeta
        ? {
            syncMode: sessionMeta.syncMode,
            preferredDeviceId: sessionMeta.preferredDeviceId,
            activeDeviceName: sessionMeta.activeDeviceName,
            stateVersion: sessionMeta.stateVersion,
          }
        : {
            syncMode: "api_device",
            preferredDeviceId: null,
            activeDeviceName: null,
            stateVersion: 0,
          },
      onLocalState: handleLocalState,
      onStateVersion: setStateVersion,
      onPollError: setPollError,
    });

    if (sessionMeta?.preferredDeviceId) {
      coordinator.startApiPolling();
    }

    return () => {
      coordinator.stop();
      coordinatorRef.current = null;
    };
  }, [enabled, slug, sessionMeta, handleLocalState]);

  useEffect(() => {
    if (initialPlayback) {
      setPlayback(initialPlayback);
    }
  }, [initialPlayback]);

  const selectDevice = useCallback(
    async (deviceId: string, deviceName: string) => {
      setPollError(null);
      const response = await fetch("/api/spotify/playback/transfer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, play: false }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error ?? "transfer_failed");
      }

      const coordinator = coordinatorRef.current;
      if (!coordinator) return;

      coordinator.setPreferredDevice(deviceId, deviceName);
      setPreferredDeviceId(deviceId);
      setActiveDeviceName(deviceName);
      setSyncMode("api_device");
      coordinator.startApiPolling();
    },
    [],
  );

  const connectSdk = useCallback(async () => {
    setSdkError(null);
    try {
      const instance = await initializeSpotifyPlayer(playerName);
      coordinatorRef.current?.startSdk(instance);
      setSyncMode("sdk");
      await instance.connect();
      setSdkReady(Boolean(instance.getDeviceId()));
    } catch (err) {
      setSdkError(err instanceof Error ? err.message : "playback_error");
    }
  }, [playerName]);

  const disconnectSdk = useCallback(() => {
    const coordinator = coordinatorRef.current;
    coordinator?.stopSdk();
    setSdkReady(false);
    setSyncMode("api_device");
    if (preferredDeviceId && coordinator) {
      coordinator.setPreferredDevice(
        preferredDeviceId,
        activeDeviceName ?? "",
      );
      coordinator.startApiPolling();
    }
  }, [preferredDeviceId, activeDeviceName]);

  const togglePlay = useCallback(async () => {
    const coordinator = coordinatorRef.current;
    if (syncMode === "sdk" && coordinator?.sdkPlayer) {
      await coordinator.sdkPlayer.togglePlay();
      return;
    }

    const action = playback?.paused ? "play" : "pause";
    await fetch("/api/spotify/playback/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        deviceId: preferredDeviceId ?? playback?.deviceId ?? undefined,
      }),
    });
  }, [syncMode, playback, preferredDeviceId]);

  const requiresDeviceSelection =
    syncMode === "api_device" && !preferredDeviceId;

  const ready =
    syncMode === "sdk" ? sdkReady : Boolean(preferredDeviceId) && !requiresDeviceSelection;

  return {
    playback,
    syncMode,
    preferredDeviceId,
    activeDeviceName,
    stateVersion,
    requiresDeviceSelection,
    ready,
    sdkReady,
    sdkError,
    pollError,
    selectDevice,
    connectSdk,
    disconnectSdk,
    togglePlay,
  };
}
