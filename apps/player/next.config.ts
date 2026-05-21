import type { NextConfig } from "next";

/** Hostnames only (sem porta) — ver block-cross-site do Next.js. */
const extraDevOrigins =
  process.env.PLAYER_ALLOWED_DEV_ORIGINS?.split(",")
    .map((origin) => origin.trim().replace(/:\d+$/, ""))
    .filter(Boolean) ?? [];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", ...extraDevOrigins],
  transpilePackages: [
    "@muziks/ui",
    "@muziks/utils",
    "@muziks/spotify",
    "@muziks/types",
    "@muziks/db",
    "@muziks/playback-client",
  ],
};

export default nextConfig;
