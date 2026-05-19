import type { BridgeConfig } from "./config.js";

export type TrackEndedPayload = {
  playerId: string;
  spotifyTrackId: string;
  trackUri: string;
  endedAt: string;
  idempotencyKey: string;
  reason: "track_ended" | "near_end" | "track_advanced";
};

/**
 * Cliente HTTP para rotas internas do apps/player.
 * @see docs/tech/ADR-librespot-playback-sidecar.md
 */
export class MuziksApiClient {
  constructor(private readonly config: BridgeConfig) {}

  private internalUrl(path: string): string {
    const base = this.config.MUZIKS_PLAYER_API_URL.replace(/\/$/, "");
    return `${base}${path}`;
  }

  private headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.config.PLAYBACK_WORKER_SECRET}`,
    };
  }

  async postTrackEnded(payload: TrackEndedPayload): Promise<Response> {
    return fetch(this.internalUrl("/api/internal/playback/track-ended"), {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
  }

  async postPlaybackTick(playerId: string): Promise<Response> {
    return fetch(this.internalUrl("/api/internal/playback-tick"), {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ playerId }),
    });
  }
}
