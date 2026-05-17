import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

type OAuthStatePayload = {
  codeVerifier: string;
  returnSlug: string;
  nonce: string;
};

function getOAuthStateSecret(): string {
  const secret =
    process.env.SPOTIFY_CLIENT_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error(
      "SPOTIFY_CLIENT_SECRET or SUPABASE_SERVICE_ROLE_KEY is required for OAuth state",
    );
  }
  return secret;
}

function sign(body: string): string {
  return createHmac("sha256", getOAuthStateSecret())
    .update(body)
    .digest("base64url");
}

/** Signed state carries PKCE verifier — survives Spotify redirect without cookies. */
export function createOAuthState(input: {
  codeVerifier: string;
  returnSlug: string;
}): string {
  const payload: OAuthStatePayload = {
    codeVerifier: input.codeVerifier,
    returnSlug: input.returnSlug,
    nonce: randomBytes(16).toString("hex"),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function parseOAuthState(
  state: string,
): Pick<OAuthStatePayload, "codeVerifier" | "returnSlug"> | null {
  const dot = state.lastIndexOf(".");
  if (dot <= 0) {
    return null;
  }

  const body = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const expected = sign(body);

  try {
    if (
      sig.length !== expected.length ||
      !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    ) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as OAuthStatePayload;

    if (
      typeof parsed.codeVerifier !== "string" ||
      typeof parsed.returnSlug !== "string" ||
      typeof parsed.nonce !== "string"
    ) {
      return null;
    }

    return {
      codeVerifier: parsed.codeVerifier,
      returnSlug: parsed.returnSlug,
    };
  } catch {
    return null;
  }
}
