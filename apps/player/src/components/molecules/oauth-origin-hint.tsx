"use client";

const configuredOrigin = process.env.NEXT_PUBLIC_PLAYER_APP_URL?.replace(
  /\/$/,
  "",
);

export function OAuthOriginHint() {
  if (process.env.NODE_ENV !== "development" || !configuredOrigin) {
    return null;
  }

  if (typeof window === "undefined") {
    return null;
  }

  if (window.location.origin === configuredOrigin) {
    return null;
  }

  return (
    <p
      role="alert"
      className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-200"
    >
      Para o login Spotify, abra{" "}
      <a href={configuredOrigin} className="font-semibold underline">
        {configuredOrigin}
      </a>{" "}
      (host atual: {window.location.origin} não bate com{" "}
      <code className="text-amber-100">NEXT_PUBLIC_PLAYER_APP_URL</code>).
    </p>
  );
}
