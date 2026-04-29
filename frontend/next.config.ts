import type { NextConfig } from "next";

const apiProxyTarget = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
