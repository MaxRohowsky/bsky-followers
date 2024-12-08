import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.bsky.app',
        port: '',
        pathname: '/img/avatar/**',
      },
    ],
  },
};

export default nextConfig;
