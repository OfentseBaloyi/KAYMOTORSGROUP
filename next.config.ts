import type { NextConfig } from "next";

// Allow next/image to load car photos from this project's Supabase Storage.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Off on purpose: with it on, car pages that weren't built at deploy time
  // are served from a shared "fallback shell", which returns a 500 on
  // Netlify's adapter. Off = each new car page renders once, then is cached.
  partialPrefetching: false,
  experimental: {
    // Photos are compressed to ~300 KB in the browser before upload; this
    // leaves headroom for the multipart overhead.
    serverActions: { bodySizeLimit: "2mb" },
  },
  // The car share images read these files from disk at request time; make
  // sure they're bundled into the server functions on any host.
  outputFileTracingIncludes: {
    "/**": ["./src/assets/fonts/**", "./public/brand/**", "./public/placeholders/**"],
  },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
