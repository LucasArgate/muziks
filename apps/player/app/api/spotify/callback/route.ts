import { exchangeAuthorizationCode, fetchSpotifyProfile } from "@muziks/spotify";
import { NextResponse } from "next/server";

import { establishSupabaseSessionFromEmail } from "@/src/lib/auth/establish-supabase-session";
import {
  ensureOwnerAccount,
  findPlayerByOwnerId,
} from "@/src/lib/auth/owner-repository";
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
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export async function GET(request: Request) {
  const appUrl = getPlayerAppUrl();
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const transient = await readOAuthTransientCookies();
  const returnSlug = transient.returnSlug?.trim() ?? "";

  const redirectWithError = (message: string, path = "") => {
    const base = returnSlug ? `${appUrl}/${returnSlug}` : `${appUrl}/login`;
    const target = path || base;
    return NextResponse.redirect(
      `${target}?spotify_error=${encodeURIComponent(message)}`,
    );
  };

  if (error) {
    await clearOAuthTransientCookies();
    return redirectWithError(error);
  }

  if (!code || !state) {
    await clearOAuthTransientCookies();
    return redirectWithError("missing_code");
  }

  if (!transient.codeVerifier || state !== transient.state) {
    await clearOAuthTransientCookies();
    return redirectWithError("invalid_state");
  }

  try {
    const tokens = await exchangeAuthorizationCode({
      clientId: getSpotifyClientId(),
      clientSecret: getSpotifyClientSecret(),
      code,
      redirectUri: getSpotifyRedirectUri(),
      codeVerifier: transient.codeVerifier,
    });

    const spotifyProfile = await fetchSpotifyProfile(tokens.access_token);
    const { userId, email } = await ensureOwnerAccount({
      spotifyProfile,
      tokens,
    });

    const supabase = await createSupabaseServerClient();
    const supabaseAdmin = createSupabaseAdminClient();
    await establishSupabaseSessionFromEmail(email, supabase, supabaseAdmin);

    await persistTokenResponse(tokens);
    await clearOAuthTransientCookies();

    const player = await findPlayerByOwnerId(userId);
    const slug = returnSlug || player?.slug;

    if (slug) {
      return NextResponse.redirect(
        `${appUrl}/${slug}?spotify_connected=1`,
      );
    }

    if (player) {
      return NextResponse.redirect(
        `${appUrl}/${player.slug}?spotify_connected=1`,
      );
    }

    return NextResponse.redirect(`${appUrl}/create`);
  } catch (err) {
    await clearOAuthTransientCookies();
    const message = err instanceof Error ? err.message : "token_exchange_failed";
    return redirectWithError(message);
  }
}
