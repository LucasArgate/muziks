import { getClientCredentialsAccessToken, searchCatalog } from "@muziks/spotify";
import { catalogSearchResultSchema } from "@muziks/types";
import { NextResponse } from "next/server";

import { getSpotifyClientId, getSpotifyClientSecret } from "@/src/config/env";
import { getOwnerSpotifyAccessTokenBySlug } from "@/src/lib/spotify/resolve-owner-token-by-slug";

const TOKEN_SKEW_MS = 60_000;

let catalogTokenCache: { accessToken: string; expiresAt: number } | null = null;

async function getCatalogFallbackAccessToken(): Promise<string | null> {
  if (
    catalogTokenCache &&
    catalogTokenCache.expiresAt > Date.now() + TOKEN_SKEW_MS
  ) {
    return catalogTokenCache.accessToken;
  }

  const clientSecret = getSpotifyClientSecret();
  if (!clientSecret) {
    return null;
  }

  const token = await getClientCredentialsAccessToken({
    clientId: getSpotifyClientId(),
    clientSecret,
  });
  catalogTokenCache = {
    accessToken: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000,
  };

  return catalogTokenCache.accessToken;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const slug = searchParams.get("slug")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ error: "query_too_short" }, { status: 400 });
  }

  if (!slug) {
    return NextResponse.json({ error: "slug_required" }, { status: 400 });
  }

  try {
    const tokenResult = await getOwnerSpotifyAccessTokenBySlug(slug);
    let accessToken: string | null = tokenResult.ok
      ? tokenResult.accessToken
      : null;

    if (!accessToken && tokenResult.ok === false) {
      if (tokenResult.code === "invalid_slug") {
        return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
      }
      if (tokenResult.code === "player_not_found") {
        return NextResponse.json({ error: "player_not_found" }, { status: 404 });
      }
      accessToken = await getCatalogFallbackAccessToken();
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "catalog_unavailable",
          message: "Não foi possível conectar ao catálogo do Spotify agora.",
        },
        { status: 503 },
      );
    }

    const searchResult = await searchCatalog(accessToken, q);
    const result = catalogSearchResultSchema.parse(searchResult);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "search_failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
