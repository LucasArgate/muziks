"use client";

import { useCallback, useState } from "react";
import type { NormalizedSpotifyPlayerState } from "@muziks/types";

export function usePlaybackSession(
  initialPlayback: NormalizedSpotifyPlayerState | null | undefined,
) {
  const [playback, setPlayback] = useState<NormalizedSpotifyPlayerState | null>(
    initialPlayback ?? null,
  );

  const onLocalState = useCallback((state: NormalizedSpotifyPlayerState) => {
    setPlayback(state);
  }, []);

  return { playback, onLocalState, setPlayback };
}
