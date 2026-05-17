/** Web participante — prod: https://muziks.app; staging: https://staging.muziks.app */
export function getWebAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_WEB_APP_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_WEB_APP_URL is not set");
  }
  return url.replace(/\/$/, "");
}

/** Link público da fila (QR, compartilhar) — muziks.app/{slug} */
export function getParticipantPlayerUrl(slug: string): string {
  const base = getWebAppUrl();
  const path = slug.replace(/^\/+/, "");
  return `${base}/${encodeURIComponent(path)}`;
}
