"use client";

import type {
  NormalizedSpotifyPlaybackQueue,
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
  PlayerMasterSessionMeta,
} from "@muziks/types";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  shouldControlViaSdk,
} from "../lib/playback-control-routing";
import {
  sdkEventToPhase,
  type SdkPhase,
  type SdkPlaybackEvent,
} from "../lib/sdk-events";
import { PlaybackSyncCoordinator } from "../services/playback-sync-coordinator";
import { initializeSpotifyPlayer } from "../services/SpotifyService";

export type UsePlaybackSyncOptions = {
  slug: string;
  playerId: string | null;
  playerName: string;
  enabled: boolean;
  sessionMeta: PlayerMasterSessionMeta | null | undefined;
  initialPlayback: NormalizedSpotifyPlayerState | null | undefined;
  onLocalState: (state: NormalizedSpotifyPlayerState) => void;
};

export function usePlaybackSync({
  slug,
  playerId,
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
    sessionMeta?.syncMode ?? "hybrid",
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
  const [hybridInitAttempted, setHybridInitAttempted] = useState(false);
  const [spotifyQueue, setSpotifyQueue] =
    useState<NormalizedSpotifyPlaybackQueue | null>(null);
  const [sdkPhase, setSdkPhase] = useState<SdkPhase>("idle");
  const [playPauseLoading, setPlayPauseLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);

  const coordinatorRef = useRef<PlaybackSyncCoordinator | null>(null);
  const playPauseLoadingRef = useRef(false);
  const skipLoadingRef = useRef(false);
  const playbackBeforeActionRef = useRef<NormalizedSpotifyPlayerState | null>(
    null,
  );
  const onLocalStateRef = useRef(onLocalState);
  onLocalStateRef.current = onLocalState;

  const handleLocalState = useCallback((state: NormalizedSpotifyPlayerState) => {
    setPlayback(state);
    onLocalStateRef.current(state);
  }, []);

  const handleSdkEvent = useCallback((event: SdkPlaybackEvent) => {
    setSdkPhase(sdkEventToPhase(event));
    if (event.kind === "lifecycle") {
      setSdkReady(event.phase === "ready");
      if (event.phase === "not_ready") {
        void coordinatorRef.current?.refreshApiOnce();
      }
    }
    if (event.kind === "error") {
      setSdkReady(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      coordinatorRef.current?.stop();
      coordinatorRef.current = null;
      setSdkReady(false);
      setHybridInitAttempted(false);
      return;
    }

    const coordinator = new PlaybackSyncCoordinator();
    coordinatorRef.current = coordinator;

    const resolvedMode = sessionMeta?.syncMode ?? "hybrid";
    coordinator.configure({
      slug,
      playerId,
      sessionMeta: sessionMeta
        ? {
            syncMode: sessionMeta.syncMode,
            preferredDeviceId: sessionMeta.preferredDeviceId,
            activeDeviceName: sessionMeta.activeDeviceName,
            stateVersion: sessionMeta.stateVersion,
          }
        : {
            syncMode: "hybrid",
            preferredDeviceId: null,
            activeDeviceName: null,
            stateVersion: 0,
          },
      onLocalState: handleLocalState,
      onSdkQueue: setSpotifyQueue,
      onStateVersion: setStateVersion,
      onPollError: setPollError,
      onSdkEvent: handleSdkEvent,
      publishRemote: "minimal",
    });

    setSyncMode(resolvedMode);

    if (
      resolvedMode === "api_device" &&
      sessionMeta?.preferredDeviceId
    ) {
      coordinator.setPreferredDevice(
        sessionMeta.preferredDeviceId,
        sessionMeta.activeDeviceName ?? "",
      );
    }

    return () => {
      coordinator.stop();
      coordinatorRef.current = null;
    };
  }, [enabled, slug, playerId, sessionMeta, handleLocalState, handleSdkEvent]);

  useEffect(() => {
    if (initialPlayback) {
      setPlayback(initialPlayback);
    }
  }, [initialPlayback]);

  useEffect(() => {
    if (!enabled || hybridInitAttempted) {
      return;
    }
    if (syncMode !== "hybrid" && syncMode !== "sdk") {
      return;
    }

    const coordinator = coordinatorRef.current;
    if (!coordinator) {
      return;
    }

    setHybridInitAttempted(true);
    void (async () => {
      setSdkError(null);
      try {
        const instance = await initializeSpotifyPlayer(playerName);
        if (syncMode === "hybrid") {
          coordinator.startHybrid(instance);
          setSyncMode("hybrid");
        } else {
          coordinator.startSdk(instance);
          setSyncMode("sdk");
        }
        await instance.connect();
        setSdkReady(Boolean(instance.getDeviceId()));
      } catch (err) {
        setSdkError(err instanceof Error ? err.message : "playback_error");
      }
    })();
  }, [enabled, hybridInitAttempted, playerName, syncMode]);

  useEffect(() => {
    if (!enabled || syncMode !== "hybrid") {
      return;
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void coordinatorRef.current?.refreshApiOnce();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [enabled, syncMode]);

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

      const body = (await response.json()) as {
        state?: NormalizedSpotifyPlayerState;
      };

      const coordinator = coordinatorRef.current;
      if (!coordinator) return;

      coordinator.stopSdk();
      coordinator.setSyncMode("api_device");
      coordinator.setPreferredDevice(deviceId, deviceName);
      setPreferredDeviceId(deviceId);
      setActiveDeviceName(deviceName);
      setSyncMode("api_device");
      setSdkReady(false);
      if (body.state) {
        coordinator.applyApiState(body.state);
      } else {
        await coordinator.refreshSessionOnce();
      }
    },
    [],
  );

  const connectSdk = useCallback(async () => {
    setSdkError(null);
    try {
      const instance = await initializeSpotifyPlayer(playerName);
      coordinatorRef.current?.startHybrid(instance);
      setSyncMode("hybrid");
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
      coordinator.setSyncMode("api_device");
    } else {
      coordinator?.setSyncMode("api_device");
    }
  }, [preferredDeviceId, activeDeviceName]);

  const resolveControlDeviceId = useCallback((): string | undefined => {
    const coordinator = coordinatorRef.current;
    if (syncMode === "api_device" && preferredDeviceId) {
      return preferredDeviceId;
    }
    return (
      coordinator?.activeControlDeviceId ??
      playback?.deviceId ??
      undefined
    );
  }, [syncMode, preferredDeviceId, playback?.deviceId]);

  const controlViaApi = useCallback(
    async (action: "play" | "pause" | "next") => {
      const coordinator = coordinatorRef.current;
      const deviceId = resolveControlDeviceId();
      const response = await fetch("/api/spotify/playback/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          deviceId,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        state?: NormalizedSpotifyPlayerState;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(body.error ?? "control_failed");
      }
      if (body.state) {
        coordinator?.applyApiState(body.state);
      } else {
        await coordinator?.refreshApiOnce();
      }
    },
    [resolveControlDeviceId],
  );

  const runPlayPauseAction = useCallback(
    async (fn: () => Promise<void>) => {
      if (playPauseLoadingRef.current) return;
      playPauseLoadingRef.current = true;
      setPlayPauseLoading(true);
      setSdkError(null);
      playbackBeforeActionRef.current = playback;
      try {
        await fn();
      } catch (err) {
        if (playbackBeforeActionRef.current) {
          setPlayback(playbackBeforeActionRef.current);
          onLocalStateRef.current(playbackBeforeActionRef.current);
        } else {
          void coordinatorRef.current?.refreshApiOnce();
        }
        setSdkError(
          err instanceof Error ? err.message : "spotify_action_failed",
        );
        throw err;
      } finally {
        playPauseLoadingRef.current = false;
        setPlayPauseLoading(false);
        playbackBeforeActionRef.current = null;
      }
    },
    [playback],
  );

  const runSkipAction = useCallback(async (fn: () => Promise<void>) => {
    if (skipLoadingRef.current) return;
    skipLoadingRef.current = true;
    setSkipLoading(true);
    setSdkError(null);
    try {
      await fn();
    } catch (err) {
      setSdkError(err instanceof Error ? err.message : "spotify_action_failed");
      throw err;
    } finally {
      skipLoadingRef.current = false;
      setSkipLoading(false);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    await runPlayPauseAction(async () => {
      const coordinator = coordinatorRef.current;
      const useSdk = shouldControlViaSdk(syncMode, playback);

      if (useSdk && coordinator?.sdkPlayer) {
        try {
          await coordinator.sdkPlayer.togglePlay();
          return;
        } catch {
          // fall through to Web API
        }
      }

      if (playback) {
        const optimistic: NormalizedSpotifyPlayerState = {
          ...playback,
          paused: !playback.paused,
          status: playback.paused ? "playing" : "paused",
          lastError: null,
        };
        setPlayback(optimistic);
        onLocalStateRef.current(optimistic);
      }

      const action = playback?.paused ? "play" : "pause";
      await controlViaApi(action);
    });
  }, [syncMode, playback, runPlayPauseAction, controlViaApi]);

  const skipToNext = useCallback(async () => {
    await runSkipAction(async () => {
      const coordinator = coordinatorRef.current;
      const useSdk = shouldControlViaSdk(syncMode, playback);

      if (useSdk && coordinator?.sdkPlayer) {
        try {
          await coordinator.sdkPlayer.nextTrack();
          return;
        } catch {
          // fall through to Web API
        }
      }

      await controlViaApi("next");
    });
  }, [syncMode, playback, runSkipAction, controlViaApi]);

  const requiresDeviceSelection =
    syncMode === "api_device" && !preferredDeviceId;

  const ready =
    syncMode === "hybrid"
      ? sdkReady || (Boolean(preferredDeviceId) && !requiresDeviceSelection)
      : syncMode === "sdk"
        ? sdkReady
        : Boolean(preferredDeviceId) && !requiresDeviceSelection;

  return {
    playback,
    spotifyQueue,
    syncMode,
    preferredDeviceId,
    activeDeviceName,
    stateVersion,
    requiresDeviceSelection,
    ready,
    sdkReady,
    sdkError,
    sdkPhase,
    pollError,
    playPauseLoading,
    skipLoading,
    selectDevice,
    applyBridgeState: (state: NormalizedSpotifyPlayerState) =>
      coordinatorRef.current?.applyBridgeState(state),
    setBridgeActive: (active: boolean) =>
      coordinatorRef.current?.setBridgeActive(active),
    connectSdk,
    disconnectSdk,
    togglePlay,
    skipToNext,
  };
}
