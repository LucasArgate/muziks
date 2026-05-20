import type { Metadata } from "next";
import { LANDING_SITE } from "@/src/config/landing-site";
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  STATIC_OG_IMAGE_PATH,
} from "@/src/config/og-site";

export type LandingPageSeo = {
  /** Título da página (sem sufixo de marca na home). */
  title: string;
  description: string;
  /** Caminho relativo, ex. `/contato`. */
  path?: string;
  /** Palavras-chave opcionais para a página. */
  keywords?: string[];
  noIndex?: boolean;
};

const defaultKeywords = [
  "muziks",
  "player democrático",
  "fila de música",
  "bar",
  "música ambiente",
  "votação música",
  "PWA",
  "telão bar",
] as const;

export function createLandingMetadata({
  title,
  description,
  path = "/",
  keywords,
  noIndex = false,
}: LandingPageSeo): Metadata {
  const isHome = path === "/";
  const pageTitle = isHome ? title : `${title} | ${LANDING_SITE.name}`;
  const canonicalPath = path === "/" ? "/" : path;
  const url = new URL(canonicalPath, LANDING_SITE.url).toString();
  const ogImageUrl = new URL(STATIC_OG_IMAGE_PATH, LANDING_SITE.url).toString();

  return {
    title: pageTitle,
    description,
    metadataBase: new URL(LANDING_SITE.url),
    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: LANDING_SITE.iconPath, sizes: "152x152", type: "image/png" },
      ],
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        { url: LANDING_SITE.iconPath, sizes: "152x152", type: "image/png" },
      ],
    },
    alternates: {
      canonical: canonicalPath,
    },
    keywords: [...defaultKeywords, ...(keywords ?? [])],
    authors: [{ name: LANDING_SITE.name, url: LANDING_SITE.url }],
    creator: LANDING_SITE.name,
    publisher: LANDING_SITE.name,
    applicationName: LANDING_SITE.name,
    category: "music",
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true },
        },
    openGraph: {
      type: "website",
      locale: LANDING_SITE.locale,
      url,
      siteName: LANDING_SITE.name,
      title: pageTitle,
      description,
      images: [
        {
          url: ogImageUrl,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: pageTitle,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

/** Metadados padrão do layout (home + template de título das demais páginas). */
export const rootLandingMetadata: Metadata = createLandingMetadata({
  title: `${LANDING_SITE.name} — ${LANDING_SITE.tagline}`,
  description: LANDING_SITE.description,
  path: "/",
  keywords: [
    "música compartilhada",
    "regras claras fila",
    "player.muziks.app",
    "muziks.app",
  ],
});
