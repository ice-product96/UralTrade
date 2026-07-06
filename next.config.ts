import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ural-trade96.ru",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
