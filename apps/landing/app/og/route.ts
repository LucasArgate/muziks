import {
  defaultOgImageCopy,
  generateOgImage,
} from "@/src/config/generate-og-image";
import { getDefaultOgSourceImage } from "@/src/config/og-site";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const title =
    requestUrl.searchParams.get("title")?.trim() || defaultOgImageCopy.title;
  const shortDescription =
    requestUrl.searchParams.get("description")?.trim() ||
    requestUrl.searchParams.get("shortDescription")?.trim() ||
    defaultOgImageCopy.shortDescription;
  const image =
    requestUrl.searchParams.get("image")?.trim() ||
    getDefaultOgSourceImage(requestUrl.origin);
  const accentHex = requestUrl.searchParams.get("color")?.trim() ?? undefined;

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
