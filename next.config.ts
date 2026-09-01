import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Open Food Facts label photographs, used as evidence on ingredient pages.
    remotePatterns: [{ protocol: "https", hostname: "images.openfoodfacts.org" }],
  },
  /** Hide the Next.js dev-tools badge; it only ever rendered in development. */
  devIndicators: false,
};

export default nextConfig;
