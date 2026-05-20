import {
  defaultOgImageInput,
  generateOgImage,
} from "@/src/config/generate-og-image";
import { DEFAULT_OG_SOURCE_IMAGE } from "@/src/config/og-site";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const title =
    url.searchParams.get("title")?.trim() || defaultOgImageInput.title;
  const shortDescription =
    url.searchParams.get("description")?.trim() ||
    url.searchParams.get("shortDescription")?.trim() ||
    defaultOgImageInput.shortDescription;
  const image =
    url.searchParams.get("image")?.trim() || DEFAULT_OG_SOURCE_IMAGE;
  const accentHex = url.searchParams.get("color")?.trim() ?? undefined;

  try {
    const png = await generateOgImage({
      title,
      shortDescription,
      image,
      accentHex,
    });

    return new Response(Buffer.from(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[og] failed to generate image", error);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
