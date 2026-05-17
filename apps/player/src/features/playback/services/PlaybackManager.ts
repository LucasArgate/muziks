import type { SpotifyServiceInstance } from "./SpotifyService";

/** Orquestra auto-next e sync — implementação completa em MVP-B. */
export class PlaybackManager {
  private service: SpotifyServiceInstance | null = null;

  start(service: SpotifyServiceInstance): void {
    this.service = service;
    service.player.addListener("player_state_changed", () => {
      // MVP-B: scheduleNextIfNearEnd + sync Supabase
    });
  }

  stop(): void {
    this.service?.disconnect();
    this.service = null;
  }

  get active(): boolean {
    return this.service !== null;
  }
}
