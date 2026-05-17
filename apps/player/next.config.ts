import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@muziks/ui",
    "@muziks/utils",
    "@muziks/spotify",
    "@muziks/types",
    "@muziks/db",
  ],
};

export default nextConfig;
