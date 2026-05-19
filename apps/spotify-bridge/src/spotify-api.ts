import type { BridgeConfig } from "./config.js";

/**
 * Integração Spotify Web API no bridge (refresh token por sessão/player).
 * Implementação futura: buscar refresh_token via API interna do Muziks (vault).
 */
export class SpotifyApiBridge {
  constructor(private readonly config: BridgeConfig) {}

  get clientId(): string | undefined {
    return this.config.SPOTIFY_CLIENT_ID;
  }

  /** Placeholder até existir endpoint de credenciais por player. */
  async refreshAccessToken(_playerId: string): Promise<string | null> {
    return null;
  }
}
