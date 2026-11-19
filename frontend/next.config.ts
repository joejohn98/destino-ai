import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendDirectory = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  cacheLife: {
    // Destination listing cache: aligns with backend Redis LISTING_CACHE_TTL (3 minutes)
    catalog: {
      stale: 60,
      revalidate: 180,
      expire: 300,
    },
    // Continent & region aggregation cache: aligns with backend AGG_CACHE_TTL (30 minutes)
    stats: {
      stale: 300,
      revalidate: 1800,
      expire: 3600,
    },
  },
  output: "standalone",
  outputFileTracingRoot: path.join(frontendDirectory, ".."),
  transpilePackages: ["@destino/shared"],
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
      },
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
    ],
  },
  turbopack: {
    root: path.join(frontendDirectory, ".."),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
};

export default nextConfig;
