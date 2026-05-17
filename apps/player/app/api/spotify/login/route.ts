import { randomBytes } from "node:crypto";
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
import { setOAuthTransientCookies } from "@/src/lib/spotify-session";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug")?.trim() ?? "";

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await createCodeChallenge(codeVerifier);
    const state = randomBytes(16).toString("hex");

    await setOAuthTransientCookies({
      codeVerifier,
      state,
      returnSlug: slug,
    });

    const authorizeUrl = buildAuthorizeUrl({
      clientId: getSpotifyClientId(),
      redirectUri: getSpotifyRedirectUri(),
      state,
      codeChallenge,
    });

    return NextResponse.redirect(authorizeUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Spotify login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
