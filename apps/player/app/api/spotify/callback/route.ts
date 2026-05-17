import { exchangeAuthorizationCode, fetchSpotifyProfile } from "@muziks/spotify";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { establishSupabaseSessionFromEmail } from "@/src/lib/auth/establish-supabase-session";
import {
  ensureOwnerAccount,
  findPlayerByOwnerId,
} from "@/src/lib/auth/owner-repository";
import {
  getPlayerAppUrlFromRequest,
  getSpotifyClientId,
  getSpotifyClientSecret,
  getSpotifyRedirectUri,
} from "@/src/config/spotify-env";
import { toSpotifyCallbackError } from "@/src/lib/auth/spotify-callback-errors";
import { parseOAuthState } from "@/src/lib/oauth-state";
import {
  applyPersistTokenResponse,
  clearOAuthTransientCookiesOnResponse,
} from "@/src/lib/spotify-session";
import type { SupabaseCookieToSet } from "@/src/lib/supabase/cookie-types";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  hasSupabaseServiceRoleKey,
} from "@/src/lib/supabase/env";

export async function GET(request: NextRequest) {
  const appUrl = getPlayerAppUrlFromRequest(request);
  const { searchParams } = request.nextUrl;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");

  const oauthState = stateParam ? parseOAuthState(stateParam) : null;
  const returnSlug = oauthState?.returnSlug?.trim() ?? "";

  const redirectWithError = (message: string, path = "") => {
    const base = returnSlug ? `${appUrl}/${returnSlug}` : `${appUrl}/login`;
    const target = path || base;
    const response = NextResponse.redirect(
      `${target}?spotify_error=${encodeURIComponent(message)}`,
    );
    clearOAuthTransientCookiesOnResponse(response);
    return response;
  };

  if (error) {
    return redirectWithError(error);
  }

  if (!code || !stateParam) {
    return redirectWithError("missing_code");
  }

  if (!oauthState?.codeVerifier) {
    return redirectWithError("invalid_state");
  }

  if (!hasSupabaseServiceRoleKey()) {
    return redirectWithError("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  try {
    const tokens = await exchangeAuthorizationCode({
      clientId: getSpotifyClientId(),
      clientSecret: getSpotifyClientSecret(),
      code,
      redirectUri: getSpotifyRedirectUri(),
      codeVerifier: oauthState.codeVerifier,
    });

    const spotifyProfile = await fetchSpotifyProfile(tokens.access_token);
    const { userId, email } = await ensureOwnerAccount({
      spotifyProfile,
      tokens,
    });

    const player = await findPlayerByOwnerId(userId);
    const slug = returnSlug || player?.slug;

    const successUrl = slug
      ? `${appUrl}/${slug}?spotify_connected=1`
      : player
        ? `${appUrl}/${player.slug}?spotify_connected=1`
        : `${appUrl}/create`;

    const response = NextResponse.redirect(successUrl);

    const supabase = createServerClient(
      getSupabaseUrl(),
      getSupabaseAnonKey(),
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: SupabaseCookieToSet[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const supabaseAdmin = createSupabaseAdminClient();
    await establishSupabaseSessionFromEmail(email, supabase, supabaseAdmin);

    applyPersistTokenResponse(response, tokens);
    clearOAuthTransientCookiesOnResponse(response);
    return response;
  } catch (err) {
    console.error("[spotify/callback]", err);
    return redirectWithError(toSpotifyCallbackError(err));
  }
}
