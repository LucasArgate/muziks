import { NextResponse } from "next/server";
import { exchangeAuthorizationCode } from "@muziks/spotify";
import {
  getPlayerAppUrl,
  getSpotifyClientId,
  getSpotifyClientSecret,
  getSpotifyRedirectUri,
} from "@/src/config/spotify-env";
import {
  clearOAuthTransientCookies,
  persistTokenResponse,
  readOAuthTransientCookies,
} from "@/src/lib/spotify-session";

export async function GET(request: Request) {
  const appUrl = getPlayerAppUrl();
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const transient = await readOAuthTransientCookies();
  const returnSlug = transient.returnSlug ?? "";

  const redirectToPlayer = (query: string) =>
    NextResponse.redirect(`${appUrl}/${returnSlug}${query}`);

  if (error) {
    await clearOAuthTransientCookies();
    return redirectToPlayer(`?spotify_error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    await clearOAuthTransientCookies();
    return redirectToPlayer("?spotify_error=missing_code");
  }

  if (!transient.codeVerifier || state !== transient.state) {
    await clearOAuthTransientCookies();
    return redirectToPlayer("?spotify_error=invalid_state");
  }

  try {
    const tokens = await exchangeAuthorizationCode({
      clientId: getSpotifyClientId(),
      clientSecret: getSpotifyClientSecret(),
      code,
      redirectUri: getSpotifyRedirectUri(),
      codeVerifier: transient.codeVerifier,
    });

    await persistTokenResponse(tokens);
    await clearOAuthTransientCookies();

    return redirectToPlayer("?spotify_connected=1");
  } catch (err) {
    await clearOAuthTransientCookies();
    const message = err instanceof Error ? err.message : "token_exchange_failed";
    return redirectToPlayer(
      `?spotify_error=${encodeURIComponent(message)}`,
    );
  }
}
