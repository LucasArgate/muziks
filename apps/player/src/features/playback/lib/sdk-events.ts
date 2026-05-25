export type SdkLifecyclePhase = "ready" | "not_ready";

export type SdkErrorCode =
  | "initialization"
  | "authentication"
  | "account"
  | "playback";

export type SdkPlaybackEvent =
  | {
      kind: "lifecycle";
      phase: SdkLifecyclePhase;
      deviceId: string | null;
    }
  | { kind: "playback"; state: Spotify.PlaybackState | null }
  | { kind: "error"; code: SdkErrorCode; message: string };

/** UI / debug phase derived from SDK events. */
export type SdkPhase = "idle" | "ready" | "playing" | "error";

export function sdkEventToPhase(event: SdkPlaybackEvent): SdkPhase {
  if (event.kind === "error") return "error";
  if (event.kind === "lifecycle") {
    return event.phase === "ready" ? "ready" : "idle";
  }
  if (!event.state) return "ready";
  if (event.state.paused) return "ready";
  return "playing";
}
