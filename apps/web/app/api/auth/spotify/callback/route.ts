import { exchangeAuthorizationCode, fetchSpotifyProfile } from "@muziks/spotify";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  getSpotifyClientId,
  getSpotifyClientSecret,
  getSpotifyRedirectUri,
  getWebAppUrlFromRequest,
} from "@/src/config/env";
import { establishSupabaseSessionFromEmail } from "@/src/lib/auth/establish-supabase-session";
import { ensureParticipantProfile } from "@/src/lib/auth/participant-repository";
import { parseParticipantOAuthState } from "@/src/lib/oauth-state";
import type { SupabaseCookieToSet } from "@/src/lib/supabase/cookie-types";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  hasSupabaseServiceRoleKey,
} from "@/src/lib/supabase/env";

export async function GET(request: NextRequest) {
  const appUrl = getWebAppUrlFromRequest(request);
  const { searchParams } = request.nextUrl;
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const stateParam = searchParams.get("state");

  const oauthState = stateParam ? parseParticipantOAuthState(stateParam) : null;
  const returnSlug = oauthState?.returnSlug?.trim() ?? "";
  const returnTo = oauthState?.returnTo?.trim() || (returnSlug ? `/${returnSlug}` : "/");

  const redirectWithError = (message: string) => {
    const target = returnSlug ? `${appUrl}/${returnSlug}` : appUrl;
    return NextResponse.redirect(
      `${target}?spotify_error=${encodeURIComponent(message)}`,
    );
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
      redirectUri: getSpotifyRedirectUri(request),
      codeVerifier: oauthState.codeVerifier,
    });

    const spotifyProfile = await fetchSpotifyProfile(tokens.access_token);
    const { email } = await ensureParticipantProfile(spotifyProfile);

    const successUrl = new URL(`${appUrl}${returnTo.startsWith("/") ? returnTo : `/${returnTo}`}`);
    successUrl.searchParams.set("identified", "1");

    const response = NextResponse.redirect(successUrl.toString());

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

    return response;
  } catch (err) {
    console.error("[web/spotify/callback]", err);
    const message = err instanceof Error ? err.message : "callback_failed";
    return redirectWithError(message);
  }
}
