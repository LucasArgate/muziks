import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@muziks/ui",
    "@muziks/utils",
    "@muziks/spotify",
    "@muziks/queue",
    "@muziks/db",
    "@muziks/types",
    "@muziks/playback-client",
  ],
};

export default nextConfig;
