import type { MetadataRoute } from "next";
import { LANDING_SITE, LANDING_SITE_URL } from "@/src/config/landing-site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${LANDING_SITE_URL}/sitemap.xml`,
    host: LANDING_SITE.url,
  };
}
