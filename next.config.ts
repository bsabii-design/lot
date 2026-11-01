import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  /* photos are served at quality 90 (the default 75 shows blocks on already compressed agency photos) */
  images: { qualities: [75, 90] },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
