"use client";

import { useCallback, useEffect, useState } from "react";
import type { NormalizedSpotifyPlayerState } from "@muziks/types";

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
  const [playback, setPlayback] = useState<NormalizedSpotifyPlayerState | null>(
    initialPlayback ?? null,
  );
  useEffect(() => {
    if (initialPlayback) {
      setPlayback(initialPlayback);
    }
  }, [initialPlayback]);

  useEffect(() => {
    if (!playerId || !subscribeRealtime) {
      return;
    }

    return subscribeSessionSnapshots(playerId, ({ playback: next }) => {
      setPlayback(next);
    });
  }, [playerId, subscribeRealtime]);

  const onLocalState = useCallback((state: NormalizedSpotifyPlayerState) => {
    setPlayback(state);
  }, []);

  return { playback, onLocalState, setPlayback };
}
