import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder host for the fixture catalog photos. Replace with the backend
    // photo/CDN host once the real `/tools` endpoint serves image URLs.
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default nextConfig;
