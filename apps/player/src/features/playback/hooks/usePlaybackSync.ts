"use client";

import type {
  NormalizedSpotifyPlaybackQueue,
  NormalizedSpotifyPlayerState,
  PlaybackSyncMode,
  PlayerMasterSessionMeta,
} from "@muziks/types";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  subscribeSessionSnapshots,
  subscribeSpotifyQueueSnapshots,
} from "@/src/lib/realtime/player-session-channel";

import {
  shouldControlViaSdk,
} from "../lib/playback-control-routing";
import {
  sdkEventToPhase,
  type SdkPhase,
  type SdkPlaybackEvent,
} from "../lib/sdk-events";
import { PlaybackSyncCoordinator } from "../services/playback-sync-coordinator";
import {
  initializeSpotifyPlayer,
  type SpotifyServiceInstance,
} from "../services/SpotifyService";

const SDK_DEVICE_WAIT_TIMEOUT_MS = 5000;
const SDK_DEVICE_WAIT_INTERVAL_MS = 100;
const BROWSER_HEARTBEAT_MS = 15000;

function normalizeRuntimeSyncMode(
  mode: PlaybackSyncMode | null | undefined,
): PlaybackSyncMode {
  return mode === "sdk" ? "sdk" : "api_device";
}

async function waitForSdkDeviceId(
  instance: SpotifyServiceInstance,
): Promise<string> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < SDK_DEVICE_WAIT_TIMEOUT_MS) {
    const deviceId = instance.getDeviceId();
    if (deviceId) {
      return deviceId;
    }
    await new Promise((resolve) =>
      window.setTimeout(resolve, SDK_DEVICE_WAIT_INTERVAL_MS),
    );
  }
  throw new Error("spotify_sdk_device_not_ready");
}

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
    normalizeRuntimeSyncMode(sessionMeta?.syncMode),
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
  const [sdkInitAttempted, setSdkInitAttempted] = useState(false);
  const [spotifyQueue, setSpotifyQueue] =
    useState<NormalizedSpotifyPlaybackQueue | null>(null);
  const [sdkPhase, setSdkPhase] = useState<SdkPhase>("idle");
  const [playPauseLoading, setPlayPauseLoading] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);

  const coordinatorRef = useRef<PlaybackSyncCoordinator | null>(null);
  const browserInstanceIdRef = useRef<string | null>(null);
  const stateVersionRef = useRef(sessionMeta?.stateVersion ?? 0);
  const playbackRef = useRef<NormalizedSpotifyPlayerState | null>(
    initialPlayback ?? null,
  );
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

  useEffect(() => {
    stateVersionRef.current = stateVersion;
  }, [stateVersion]);

  useEffect(() => {
    playbackRef.current = playback;
  }, [playback]);

  useEffect(() => {
    const nextVersion = sessionMeta?.stateVersion ?? 0;
    if (nextVersion < stateVersionRef.current) {
      return;
    }
    stateVersionRef.current = nextVersion;
    setStateVersion(nextVersion);
  }, [playerId, sessionMeta?.stateVersion]);

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
      setSdkInitAttempted(false);
      return;
    }

    const coordinator = new PlaybackSyncCoordinator();
    coordinatorRef.current = coordinator;
    if (!browserInstanceIdRef.current) {
      browserInstanceIdRef.current =
        window.crypto?.randomUUID?.() ?? `browser-${Date.now()}`;
    }

    const resolvedMode = normalizeRuntimeSyncMode(sessionMeta?.syncMode);
    coordinator.configure({
      slug,
      playerId,
      browserInstanceId: browserInstanceIdRef.current,
      sessionMeta: sessionMeta
        ? {
            syncMode: resolvedMode,
            preferredDeviceId: sessionMeta.preferredDeviceId,
            activeDeviceName: sessionMeta.activeDeviceName,
            stateVersion: sessionMeta.stateVersion,
            authority: sessionMeta.authority,
            stateSource: sessionMeta.stateSource,
            sourceUpdatedAt: sessionMeta.sourceUpdatedAt,
          }
        : {
            syncMode: "api_device",
            preferredDeviceId: null,
            activeDeviceName: null,
            stateVersion: 0,
          },
      onLocalState: handleLocalState,
      onSdkQueue: setSpotifyQueue,
      onStateVersion: setStateVersion,
      onActiveDeviceName: setActiveDeviceName,
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
      const initialVersion = sessionMeta?.stateVersion ?? 0;
      const current = playbackRef.current;
      const shouldApply = !current || initialVersion > stateVersionRef.current;
      if (!shouldApply) {
        return;
      }
      stateVersionRef.current = initialVersion;
      playbackRef.current = initialPlayback;
      setPlayback(initialPlayback);
    }
  }, [initialPlayback, sessionMeta?.stateVersion]);

  useEffect(() => {
    if (!enabled || !playerId) {
      return;
    }

    return subscribeSessionSnapshots(
      playerId,
      ({ playback: next, stateVersion, authority, sourceUpdatedAt }) => {
        coordinatorRef.current?.setRemoteSessionAuthority(
          authority,
          sourceUpdatedAt,
        );

        if (stateVersion <= stateVersionRef.current) {
          return;
        }

        stateVersionRef.current = stateVersion;
        setStateVersion(stateVersion);
        coordinatorRef.current?.applySyncedSessionState(next);
      },
    );
  }, [enabled, playerId]);

  useEffect(() => {
    if (!enabled || !playerId) {
      return;
    }

    return subscribeSpotifyQueueSnapshots(playerId, ({ queue }) => {
      setSpotifyQueue(queue);
    });
  }, [enabled, playerId]);

  useEffect(() => {
    if (!enabled || sdkInitAttempted) {
      return;
    }
    if (syncMode !== "sdk") {
      return;
    }

    const coordinator = coordinatorRef.current;
    if (!coordinator) {
      return;
    }

    setSdkInitAttempted(true);
    void (async () => {
      setSdkError(null);
      try {
        const instance = await initializeSpotifyPlayer(playerName);
        coordinator.startSdk(instance);
        setSyncMode("sdk");
        await instance.connect();
        setSdkReady(Boolean(instance.getDeviceId()));
      } catch (err) {
        setSdkError(err instanceof Error ? err.message : "playback_error");
      }
    })();
  }, [enabled, sdkInitAttempted, playerName, syncMode]);

  useEffect(() => {
    if (!enabled || syncMode !== "api_device") {
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

  useEffect(() => {
    if (
      !enabled ||
      !sdkReady ||
      syncMode !== "sdk"
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      coordinatorRef.current?.publishBrowserHeartbeat();
    }, BROWSER_HEARTBEAT_MS);

    return () => window.clearInterval(timer);
  }, [enabled, sdkReady, syncMode]);

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
        activeDeviceName?: string | null;
      };
      const coordinator = coordinatorRef.current;
      if (!coordinator) return;

      coordinator.stopSdk();
      coordinator.setSyncMode("api_device");
      coordinator.setPreferredDevice(deviceId, deviceName);
      setPreferredDeviceId(deviceId);
      setActiveDeviceName(body.activeDeviceName ?? deviceName);
      setSyncMode("api_device");
      setSdkReady(false);
      if (body.state) {
        coordinator.applyApiState(body.state, body.activeDeviceName ?? deviceName);
      } else {
        await coordinator.refreshSessionOnce();
      }
    },
    [activeDeviceName, playback?.deviceId, preferredDeviceId, syncMode],
  );

  const connectSdk = useCallback(async (contextUri?: string) => {
    setSdkError(null);
    try {
      const instance = await initializeSpotifyPlayer(playerName);
      coordinatorRef.current?.startSdk(instance);
      setSyncMode("sdk");
      await instance.connect();
      const deviceId = await waitForSdkDeviceId(instance);
      setSdkReady(true);

      const response = await fetch("/api/spotify/playback/transfer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, play: !contextUri }),
      });

      const body = (await response.json().catch(() => ({}))) as {
        state?: NormalizedSpotifyPlayerState;
        activeDeviceName?: string | null;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(body.error ?? "transfer_failed");
      }
      if (body.state) {
        coordinatorRef.current?.applyApiState(body.state, body.activeDeviceName);
      }

      if (contextUri) {
        const playbackResponse = await fetch("/api/spotify/playback/control", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "play",
            deviceId,
            contextUri,
          }),
        });
        const playbackBody = (await playbackResponse
          .json()
          .catch(() => ({}))) as {
          state?: NormalizedSpotifyPlayerState;
          activeDeviceName?: string | null;
          error?: string;
        };
        if (!playbackResponse.ok) {
          throw new Error(playbackBody.error ?? "control_failed");
        }
        if (playbackBody.state) {
          coordinatorRef.current?.applyApiState(
            playbackBody.state,
            playbackBody.activeDeviceName,
          );
        }
      }
    } catch (err) {
      setSdkError(err instanceof Error ? err.message : "playback_error");
    }
  }, [playerName, playback?.deviceId, playback?.status, playback?.trackUri]);

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
    return (
      coordinator?.activeControlDeviceId ??
      playback?.deviceId ??
      preferredDeviceId ??
      undefined
    );
  }, [preferredDeviceId, playback?.deviceId]);

  const controlViaApi = useCallback(
    async (
      action: "play" | "pause" | "next",
      options?: { contextUri?: string },
    ) => {
      const coordinator = coordinatorRef.current;
      const deviceId = resolveControlDeviceId();
      const response = await fetch("/api/spotify/playback/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          deviceId,
          contextUri: options?.contextUri,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as {
        state?: NormalizedSpotifyPlayerState;
        activeDeviceName?: string | null;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(body.error ?? "control_failed");
      }
      if (body.state) {
        coordinator?.applyApiState(body.state, body.activeDeviceName);
      } else {
        await coordinator?.refreshApiOnce();
      }
    },
    [
      resolveControlDeviceId,
      syncMode,
      preferredDeviceId,
      playback?.deviceId,
    ],
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

      const action = playback?.paused === false ? "pause" : "play";
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

  const startContextPlayback = useCallback(
    async (contextUri: string) => {
      await runPlayPauseAction(async () => {
        await controlViaApi("play", { contextUri });
      });
    },
    [controlViaApi, runPlayPauseAction],
  );

  const requiresDeviceSelection =
    syncMode === "api_device" && !preferredDeviceId && !playback?.deviceId;

  const ready =
    syncMode === "sdk"
      ? sdkReady
      : Boolean(playback?.deviceId ?? preferredDeviceId) &&
        !requiresDeviceSelection;
  const resolvedActiveDeviceName =
    syncMode === "api_device" &&
    playback?.deviceId &&
    preferredDeviceId &&
    playback.deviceId !== preferredDeviceId
      ? (activeDeviceName ?? "Dispositivo Spotify ativo")
      : activeDeviceName;

  return {
    playback,
    spotifyQueue,
    syncMode,
    preferredDeviceId,
    activeDeviceName: resolvedActiveDeviceName,
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
    startContextPlayback,
  };
}
