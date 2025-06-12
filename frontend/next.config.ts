import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.iconscout.com",
      },
      {
        protocol: "https",
        hostname: "s3.coinmarketcap.com",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
    ],
  },
};

export default nextConfig;
