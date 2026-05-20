import { LANDING_SITE_URL } from "@/src/config/landing-site";

export const OG_IMAGE_WIDTH = 800;
export const OG_IMAGE_HEIGHT = 420;

/** Imagem padrão para extrair cor de fundo e preview no card OG. */
export const DEFAULT_OG_SOURCE_IMAGE = `${LANDING_SITE_URL}/brand/muziks-og-icon.png`;

export type OgImageQuery = {
  title: string;
  shortDescription: string;
  image?: string;
};

/** Monta URL absoluta do endpoint `/og` com query params para redes sociais. */
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
  return new URL(`/og?${params.toString()}`, LANDING_SITE_URL).toString();
}
