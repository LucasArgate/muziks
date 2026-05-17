import {
  getAccessTokenForPlayer as getAccessTokenForPlayerCore,
  getAccessTokenForUser as getAccessTokenForUserCore,
  hasValidConnectionForUser as hasValidConnectionForUserCore,
  persistSpotifyTokens as persistSpotifyTokensCore,
} from "@muziks/db";
import type { SpotifyTokenResponse } from "@muziks/spotify";

import { spotifyTokenVaultDeps } from "@/src/lib/spotify/vault-deps";

export async function persistSpotifyTokens(
  userId: string,
  tokens: SpotifyTokenResponse,
): Promise<void> {
  return persistSpotifyTokensCore(userId, tokens, spotifyTokenVaultDeps);
}

export async function getAccessTokenForUser(
  userId: string,
): Promise<string | null> {
  return getAccessTokenForUserCore(userId, spotifyTokenVaultDeps);
}

export async function hasValidConnectionForUser(
  userId: string,
): Promise<boolean> {
  return hasValidConnectionForUserCore(userId, spotifyTokenVaultDeps);
}

export async function getAccessTokenForPlayer(
  playerId: string,
): Promise<string | null> {
  return getAccessTokenForPlayerCore(playerId, spotifyTokenVaultDeps);
}
