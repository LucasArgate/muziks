import type { NextConfig } from "next";

/**
 * Landing institucional: SSG (Static Site Generation).
 * Rotas em `app/` usam `export const dynamic = "force-static"` para
 * pré-render no build; `robots.ts` e `sitemap.ts` também são estáticos.
 */
const nextConfig: NextConfig = {
  transpilePackages: ["@muziks/ui", "@muziks/utils"],
  serverExternalPackages: ["@resvg/resvg-js", "fast-average-color-node"],
};

export default nextConfig;
