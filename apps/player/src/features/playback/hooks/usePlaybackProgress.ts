"use client";

import type { NormalizedSpotifyPlayerState } from "@muziks/types";
import {
  computeLivePositionMs,
  computeProgressPercent,
  formatPlaybackTime,
  type PlaybackProgressSnapshot,
} from "@muziks/utils";
import { useEffect, useMemo, useState } from "react";

function toSnapshot(
  playback: NormalizedSpotifyPlayerState,
): PlaybackProgressSnapshot {
  return {
    positionMs: playback.positionMs,
    durationMs: playback.durationMs,
    paused: playback.paused,
    positionUpdatedAt: playback.positionUpdatedAt ?? Date.now(),
  };
}

export type PlaybackProgressView = {
  positionMs: number;
  progressPercent: number;
  currentTime: string;
  durationTime: string;
  hasDuration: boolean;
};

const EMPTY: PlaybackProgressView = {
  positionMs: 0,
  progressPercent: 0,
  currentTime: "0:00",
  durationTime: "0:00",
  hasDuration: false,
};

export function usePlaybackProgress(
  playback: NormalizedSpotifyPlayerState | null,
): PlaybackProgressView {
  const snapshot = useMemo(
    () => (playback ? toSnapshot(playback) : null),
    [playback],
  );

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
  }, [snapshot]);

  useEffect(() => {
    if (!snapshot || snapshot.paused || snapshot.durationMs <= 0) {
      return;
    }

    let frame = 0;
    const tick = () => {
      setNow(Date.now());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [snapshot]);

  if (!snapshot || snapshot.durationMs <= 0) {
    return EMPTY;
  }

  const positionMs = computeLivePositionMs(snapshot, now);
  return {
    positionMs,
    progressPercent: computeProgressPercent(snapshot, now),
    currentTime: formatPlaybackTime(positionMs),
    durationTime: formatPlaybackTime(snapshot.durationMs),
    hasDuration: true,
  };
}
