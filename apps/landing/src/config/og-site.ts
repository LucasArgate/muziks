import { LANDING_SITE } from "@/src/config/landing-site";

export const OG_IMAGE_WIDTH = 800;
export const OG_IMAGE_HEIGHT = 420;

export type OgImageQuery = {
  title: string;
  shortDescription: string;
  image?: string;
};

/** Caminho relativo do endpoint OG (Next resolve com `metadataBase`). */
export function buildOgImageUrl({
  title,
  shortDescription,
  image,
}: OgImageQuery): string {
  const params = new URLSearchParams({
    title,
    description: shortDescription,
  });
  if (image) {
    params.set("image", image);
  }
  return `/og?${params.toString()}`;
}

/** URL absoluta da imagem de marca para extração de cor (usa a origem do request). */
export function getDefaultOgSourceImage(siteUrl: string): string {
  return new URL(LANDING_SITE.ogImagePath, siteUrl).toString();
}
