import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Open Food Facts label photographs, used as evidence on ingredient pages.
    remotePatterns: [{ protocol: "https", hostname: "images.openfoodfacts.org" }],
  },
  /** Hide the Next.js dev-tools badge; it only ever rendered in development. */
  devIndicators: false,

  /**
   * Hosts allowed to load dev-server assets, for testing on a real phone.
   *
   * `next dev` serves `/_next/*` only to localhost by default and blocks every
   * other origin. The page still renders — it is server-rendered — but every
   * script is refused, so React never hydrates and nothing on the page
   * responds: no menu, no camera, no buttons. It looks like broken UI rather
   * than a blocked request, which is why this is worth a comment.
   *
   * Development only; `next build` ignores it entirely.
   */
  allowedDevOrigins: [
    // Private LAN ranges, for opening the dev server on a device on this WiFi.
    "192.168.*.*",
    "10.*.*.*",
    "172.16.*.*",
    // Quick tunnels, which hand out a fresh random hostname each run.
    "*.trycloudflare.com",
    "*.ngrok-free.app",
    "*.ngrok.io",
  ],
};

export default nextConfig;
