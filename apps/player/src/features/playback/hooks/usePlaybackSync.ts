"use client";

import {
  applyMasterPlayback,
  useMasterPlaybackStore,
  useSpotifyQueueStore,
} from "@muziks/playback-client";
import type {
  NormalizedSpotifyPlayerState,
  PlayerMasterSessionMeta,
} from "@muziks/types";
import { useCallback, useEffect, useRef, useState } from "react";

import { parseJsonResponse } from "../lib/parse-json-response";
import { resolvePlaybackControlErrorMessage } from "../lib/playback-control-errors";
import { shouldControlViaSdk } from "../lib/playback-control-routing";
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
};

export function usePlaybackSync({
  slug,
  playerId,
  playerName,
  enabled,
  sessionMeta,
  initialPlayback,
}: UsePlaybackSyncOptions) {
  const playback = useMasterPlaybackStore((s) => s.playback);
  const syncMode = useMasterPlaybackStore((s) => s.syncMode);
  const preferredDeviceId = useMasterPlaybackStore((s) => s.preferredDeviceId);
  const activeDeviceName = useMasterPlaybackStore((s) => s.activeDeviceName);
  const stateVersion = useMasterPlaybackStore((s) => s.stateVersion);
  const playPauseLoading = useMasterPlaybackStore((s) => s.playPauseLoading);
  const skipLoading = useMasterPlaybackStore((s) => s.skipLoading);
  const spotifyQueue = useSpotifyQueueStore((s) => s.queue);

  const setSyncMode = useMasterPlaybackStore((s) => s.setSyncMode);
  const setPreferredDevice = useMasterPlaybackStore((s) => s.setPreferredDevice);
  const setStateVersion = useMasterPlaybackStore((s) => s.setStateVersion);
  const setPlayPauseLoading = useMasterPlaybackStore((s) => s.setPlayPauseLoading);
  const setSkipLoading = useMasterPlaybackStore((s) => s.setSkipLoading);
  const resetMasterPlayback = useMasterPlaybackStore((s) => s.resetMasterPlayback);
  const setSpotifyQueue = useSpotifyQueueStore((s) => s.setQueue);

  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [hybridInitAttempted, setHybridInitAttempted] = useState(false);
  const [sdkPhase, setSdkPhase] = useState<SdkPhase>("idle");

  const coordinatorRef = useRef<PlaybackSyncCoordinator | null>(null);
  const playPauseLoadingRef = useRef(false);
  const skipLoadingRef = useRef(false);
  const playbackBeforeActionRef = useRef<NormalizedSpotifyPlayerState | null>(
    null,
  );

  const handleLocalState = useCallback((state: NormalizedSpotifyPlayerState) => {
    applyMasterPlayback(state);
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
    resetMasterPlayback({
      playback: initialPlayback ?? null,
      syncMode: sessionMeta?.syncMode ?? "hybrid",
      preferredDeviceId: sessionMeta?.preferredDeviceId ?? null,
      activeDeviceName: sessionMeta?.activeDeviceName ?? null,
      stateVersion: sessionMeta?.stateVersion ?? 0,
    });
  // Hydrate store once per player route; live updates come from coordinator.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [slug, playerId, resetMasterPlayback]);

  useEffect(() => {
    if (initialPlayback) {
      applyMasterPlayback(initialPlayback);
    }
  }, [initialPlayback]);

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

    if (resolvedMode === "api_device" && sessionMeta?.preferredDeviceId) {
      coordinator.setPreferredDevice(
        sessionMeta.preferredDeviceId,
        sessionMeta.activeDeviceName ?? "",
      );
    }

    return () => {
      coordinator.stop();
      coordinatorRef.current = null;
    };
  }, [
    enabled,
    slug,
    playerId,
    sessionMeta,
    handleLocalState,
    handleSdkEvent,
    setSpotifyQueue,
    setStateVersion,
    setSyncMode,
  ]);

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
  }, [enabled, hybridInitAttempted, playerName, setSyncMode, syncMode]);

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

      const body = await parseJsonResponse<{
        error?: string;
        state?: NormalizedSpotifyPlayerState;
      }>(response);

      if (!response.ok) {
        throw new Error(body?.error ?? "transfer_failed");
      }

      const coordinator = coordinatorRef.current;
      if (!coordinator) return;

      coordinator.stopSdk();
      coordinator.setSyncMode("api_device");
      coordinator.setPreferredDevice(deviceId, deviceName);
      setPreferredDevice(deviceId, deviceName);
      setSyncMode("api_device");
      setSdkReady(false);
      if (body?.state) {
        coordinator.applyApiState(body.state);
      } else {
        await coordinator.refreshSessionOnce();
      }
    },
    [setPreferredDevice, setSyncMode],
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
  }, [playerName, setSyncMode]);

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
  }, [activeDeviceName, preferredDeviceId, setSyncMode]);

  const resolveControlDeviceId = useCallback((): string | undefined => {
    const coordinator = coordinatorRef.current;
    if (syncMode === "api_device" && preferredDeviceId) {
      return preferredDeviceId;
    }
    return (
      playback?.deviceId ??
      coordinator?.activeControlDeviceId ??
      undefined
    );
  }, [syncMode, preferredDeviceId, playback?.deviceId]);

  const controlViaApi = useCallback(
    async (action: "play" | "pause" | "next") => {
      const deviceId = resolveControlDeviceId();
      const response = await fetch("/api/spotify/playback/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          deviceId,
        }),
      });
      const body = await parseJsonResponse<{
        ok?: boolean;
        error?: string;
        message?: string;
      }>(response);
      if (!response.ok) {
        throw new Error(resolvePlaybackControlErrorMessage(body));
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
          applyMasterPlayback(playbackBeforeActionRef.current);
        } else {
          void coordinatorRef.current?.refreshApiOnce();
        }
        setSdkError(
          err instanceof Error ? err.message : "spotify_action_failed",
        );
      } finally {
        playPauseLoadingRef.current = false;
        setPlayPauseLoading(false);
        playbackBeforeActionRef.current = null;
      }
    },
    [playback, setPlayPauseLoading],
  );

  const runSkipAction = useCallback(
    async (fn: () => Promise<void>) => {
      if (skipLoadingRef.current) return;
      skipLoadingRef.current = true;
      setSkipLoading(true);
      setSdkError(null);
      try {
        await fn();
      } catch (err) {
        setSdkError(err instanceof Error ? err.message : "spotify_action_failed");
      } finally {
        skipLoadingRef.current = false;
        setSkipLoading(false);
      }
    },
    [setSkipLoading],
  );

  const togglePlay = useCallback(async () => {
    await runPlayPauseAction(async () => {
      const coordinator = coordinatorRef.current;
      const sdkDeviceId = coordinator?.sdkDeviceId ?? null;
      const useSdk = shouldControlViaSdk(syncMode, playback, sdkDeviceId);
      const targetPaused = !playback?.paused;

      if (useSdk && coordinator?.sdkPlayer) {
        coordinator.setPendingIntent(targetPaused);
        if (playback) {
          applyMasterPlayback({
            ...playback,
            paused: targetPaused,
            status: targetPaused ? "paused" : "playing",
            lastError: null,
          });
        }
        try {
          await coordinator.sdkPlayer.togglePlay();
          return;
        } catch {
          // fall through to Web API
        }
      }

      coordinator?.setPendingIntent(targetPaused);

      if (playback) {
        applyMasterPlayback({
          ...playback,
          paused: targetPaused,
          status: targetPaused ? "paused" : "playing",
          lastError: null,
        });
      }

      const action = playback?.paused ? "play" : "pause";
      await controlViaApi(action);
    });
  }, [syncMode, playback, runPlayPauseAction, controlViaApi]);

  const skipToNext = useCallback(async () => {
    await runSkipAction(async () => {
      const coordinator = coordinatorRef.current;
      const sdkDeviceId = coordinator?.sdkDeviceId ?? null;
      const useSdk = shouldControlViaSdk(syncMode, playback, sdkDeviceId);

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
