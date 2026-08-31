import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
      {
        pathname: "/logo.png",
      },
      {
        pathname: "/demo/**",
      },
    ],
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
