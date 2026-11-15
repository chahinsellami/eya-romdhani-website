import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Portfolio photography is served from Unsplash; next/image needs the host
    // allow-listed before it will optimise it.
    // No remote hosts are allow-listed any more: every photograph is served
    // from /public/images/portfolio. If stock or a CDN is reintroduced, add the
    // host here or next/image will refuse to optimise it.
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
