import type { NextConfig } from "next";

const siteHost = (() => {
  try {
    return new URL(process.env.SITE_URL ?? "http://localhost:3000").hostname;
  } catch {
    return "localhost";
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ural-trade96.ru",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: siteHost,
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
