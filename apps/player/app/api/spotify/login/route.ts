import { NextResponse } from "next/server";
import {
  buildAuthorizeUrl,
  createCodeChallenge,
  generateCodeVerifier,
} from "@muziks/spotify";
import {
  getSpotifyClientId,
  getSpotifyRedirectUri,
} from "@/src/config/spotify-env";
import { createOAuthState } from "@/src/lib/oauth-state";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim() ?? "";

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await createCodeChallenge(codeVerifier);
    const state = createOAuthState({ codeVerifier, returnSlug: slug });

    const authorizeUrl = buildAuthorizeUrl({
      clientId: getSpotifyClientId(),
      redirectUri: getSpotifyRedirectUri(request),
      state,
      codeChallenge,
    });

    return NextResponse.redirect(authorizeUrl, 302);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Spotify login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
