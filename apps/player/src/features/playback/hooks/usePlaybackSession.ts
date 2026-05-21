"use client";

import { applyMasterPlayback, useMasterPlaybackStore } from "@muziks/playback-client";
import type { NormalizedSpotifyPlayerState } from "@muziks/types";
import { useCallback, useEffect } from "react";

import { subscribeSessionSnapshots } from "@/src/lib/realtime/player-session-channel";

export type UsePlaybackSessionOptions = {
  playerId: string | null;
  initialPlayback: NormalizedSpotifyPlayerState | null | undefined;
  /** When false, only local state from Master sync (no Realtime subscribe). */
  subscribeRealtime?: boolean;
};

export function usePlaybackSession({
  playerId,
  initialPlayback,
  subscribeRealtime = true,
}: UsePlaybackSessionOptions) {
  const playback = useMasterPlaybackStore((s) => s.playback);

  useEffect(() => {
    if (initialPlayback) {
      applyMasterPlayback(initialPlayback);
    }
  }, [initialPlayback]);

  useEffect(() => {
    if (!playerId || !subscribeRealtime) {
      return;
    }

    return subscribeSessionSnapshots(playerId, ({ playback: next }) => {
      applyMasterPlayback(next);
    });
  }, [playerId, subscribeRealtime]);

  const onLocalState = useCallback((state: NormalizedSpotifyPlayerState) => {
    applyMasterPlayback(state);
  }, []);

  return { playback, onLocalState, setPlayback: applyMasterPlayback };
}
