import { getLandingAppUrl } from "@/src/config/app-urls";

export function getLandingSiteUrl(): string {
  return getLandingAppUrl();
}

export const LANDING_SITE_URL = getLandingSiteUrl();

export const LANDING_SITE = {
  name: "Muziks",
  tagline: "Música compartilhada com regras claras",
  description:
    "Player democrático para bares e espaços. O público escolhe e vota na fila — com política antes do volume.",
  locale: "pt_BR",
  url: LANDING_SITE_URL,
  /** Favicon / apple-touch (quadrados — DESIGN.md §7). */
  iconPath: "/brand/Muziks-152.png",
  /** Ícone de faders para Open Graph / Twitter (docs/images/identity/favicon-large.png). */
  ogImagePath: "/brand/muziks-og-icon.png",
  contactEmail: "contato@muziks.com.br",
} as const;

/** Rotas estáticas pré-renderizadas no build (SSG). */
export const LANDING_STATIC_ROUTES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/contato", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/termos", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/privacidade", changeFrequency: "yearly" as const, priority: 0.3 },
] as const;
