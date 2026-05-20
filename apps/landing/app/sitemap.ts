import type { MetadataRoute } from "next";
import {
  LANDING_SITE_URL,
  LANDING_STATIC_ROUTES,
} from "@/src/config/landing-site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return LANDING_STATIC_ROUTES.map((route) => ({
    url: new URL(route.path, LANDING_SITE_URL).toString(),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
