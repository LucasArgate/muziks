/** URL de produção — override com NEXT_PUBLIC_SITE_URL em preview/staging. */
export const LANDING_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://muziks.com.br";

export const LANDING_SITE = {
  name: "Muziks",
  tagline: "Música compartilhada com regras claras",
  description:
    "Player democrático para bares e espaços. O público escolhe e vota na fila — com política antes do volume.",
  locale: "pt_BR",
  url: LANDING_SITE_URL,
  /** Imagem padrão para Open Graph / Twitter (absoluta via metadataBase). */
  ogImagePath: "/brand/Muziks-152.png",
  contactEmail: "contato@muziks.com.br",
} as const;

/** Rotas estáticas pré-renderizadas no build (SSG). */
export const LANDING_STATIC_ROUTES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/contato", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/termos", changeFrequency: "yearly" as const, priority: 0.3 },
  { path: "/privacidade", changeFrequency: "yearly" as const, priority: 0.3 },
] as const;
