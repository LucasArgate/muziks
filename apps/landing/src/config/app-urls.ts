/** Porta padrão do `next dev` / fallback só fora da Vercel (`apps/landing/package.json`). */
export const LOCAL_LANDING_DEV_URL = "http://localhost:3001";

/** Site institucional — prod: https://muziks.com.br; staging: https://staging.muziks.com.br */
export function tryGetLandingAppUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_LANDING_APP_URL?.trim();
  if (!url) {
    return null;
  }
  return url.replace(/\/$/, "");
}

export function getLandingAppUrl(): string {
  const url = tryGetLandingAppUrl();
  if (url) {
    return url;
  }

  // Vercel exige env explícita por escopo (Production / Preview).
  if (process.env.VERCEL === "1") {
    throw new Error("NEXT_PUBLIC_LANDING_APP_URL is not set");
  }

  return LOCAL_LANDING_DEV_URL;
}
