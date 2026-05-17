import {
  getAccessTokenForPlayer as getAccessTokenForPlayerCore,
  getAccessTokenForUser as getAccessTokenForUserCore,
  hasValidConnectionForUser as hasValidConnectionForUserCore,
  persistSpotifyTokens as persistSpotifyTokensCore,
} from "@muziks/db";
import type { SpotifyTokenResponse } from "@muziks/spotify";

import { getSpotifyTokenVaultDeps } from "@/src/lib/spotify/vault-deps";

export async function persistSpotifyTokens(
  userId: string,
  tokens: SpotifyTokenResponse,
): Promise<void> {
  return persistSpotifyTokensCore(userId, tokens, getSpotifyTokenVaultDeps());
}

export async function getAccessTokenForUser(
  userId: string,
): Promise<string | null> {
  return getAccessTokenForUserCore(userId, getSpotifyTokenVaultDeps());
}

export async function hasValidConnectionForUser(
  userId: string,
): Promise<boolean> {
  return hasValidConnectionForUserCore(userId, getSpotifyTokenVaultDeps());
}

export async function getAccessTokenForPlayer(
  playerId: string,
): Promise<string | null> {
  return getAccessTokenForPlayerCore(playerId, getSpotifyTokenVaultDeps());
}
