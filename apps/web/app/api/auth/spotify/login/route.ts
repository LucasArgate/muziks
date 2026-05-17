import {
  buildAuthorizeUrl,
  createCodeChallenge,
  generateCodeVerifier,
  SPOTIFY_PARTICIPANT_SCOPES,
} from "@muziks/spotify";
import { NextResponse } from "next/server";

import {
  getSpotifyClientId,
  getSpotifyRedirectUri,
} from "@/src/config/env";
import { createParticipantOAuthState } from "@/src/lib/oauth-state";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim() ?? "";
    const returnTo = searchParams.get("returnTo")?.trim();

    if (!slug) {
      return NextResponse.json({ error: "slug_required" }, { status: 400 });
    }

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await createCodeChallenge(codeVerifier);
    const state = createParticipantOAuthState({
      codeVerifier,
      returnSlug: slug,
      returnTo: returnTo || `/${slug}`,
    });

    const authorizeUrl = buildAuthorizeUrl({
      clientId: getSpotifyClientId(),
      redirectUri: getSpotifyRedirectUri(request),
      state,
      codeChallenge,
      scopes: SPOTIFY_PARTICIPANT_SCOPES,
    });

    return NextResponse.redirect(authorizeUrl, 302);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Spotify login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
