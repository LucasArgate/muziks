/** Web participante — prod: https://muziks.app; staging: https://staging.muziks.app */
export function tryGetWebAppUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_WEB_APP_URL?.trim();
  if (!url) {
    return null;
  }
  return url.replace(/\/$/, "");
}

export function getWebAppUrl(): string {
  const url = tryGetWebAppUrl();
  if (!url) {
    throw new Error("NEXT_PUBLIC_WEB_APP_URL is not set");
  }
  return url;
}

/** Landing institucional — prod: https://muziks.com.br */
export function getLandingAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_LANDING_APP_URL?.trim();
  return (url || "https://muziks.com.br").replace(/\/$/, "");
}

/** Link público da fila (QR, compartilhar) — muziks.app/{slug} */
export function tryGetParticipantPlayerUrl(slug: string): string | null {
  const base = tryGetWebAppUrl();
  if (!base) {
    return null;
  }
  const path = slug.replace(/^\/+/, "");
  return `${base}/${encodeURIComponent(path)}`;
}

export function getParticipantPlayerUrl(slug: string): string {
  const url = tryGetParticipantPlayerUrl(slug);
  if (!url) {
    throw new Error("NEXT_PUBLIC_WEB_APP_URL is not set");
  }
  return url;
}
