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
    positionUpdatedAt: playback.positionUpdatedAt ?? 0,
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

function staticProgressView(
  snapshot: PlaybackProgressSnapshot,
): PlaybackProgressView {
  const positionMs = Math.min(snapshot.positionMs, snapshot.durationMs);
  return {
    positionMs,
    progressPercent: (positionMs / snapshot.durationMs) * 100,
    currentTime: formatPlaybackTime(positionMs),
    durationTime: formatPlaybackTime(snapshot.durationMs),
    hasDuration: true,
  };
}

export function usePlaybackProgress(
  playback: NormalizedSpotifyPlayerState | null,
): PlaybackProgressView {
  const snapshot = useMemo(
    () => (playback ? toSnapshot(playback) : null),
    [playback],
  );

  const [hydrated, setHydrated] = useState(false);
  const [liveNow, setLiveNow] = useState<number | null>(null);

  useEffect(() => {
    setHydrated(true);
    setLiveNow(Date.now());
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setLiveNow(Date.now());
  }, [snapshot, hydrated]);

  const paused = snapshot?.paused ?? true;

  useEffect(() => {
    if (!hydrated || !snapshot || paused || snapshot.durationMs <= 0) {
      return;
    }

    let frame = 0;
    const tick = () => {
      setLiveNow(Date.now());
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, snapshot, hydrated]);

  if (!snapshot || snapshot.durationMs <= 0) {
    return EMPTY;
  }

  if (!hydrated || liveNow === null) {
    return staticProgressView(snapshot);
  }

  const positionMs = computeLivePositionMs(snapshot, liveNow);
  return {
    positionMs,
    progressPercent: computeProgressPercent(snapshot, liveNow),
    currentTime: formatPlaybackTime(positionMs),
    durationTime: formatPlaybackTime(snapshot.durationMs),
    hasDuration: true,
  };
}
