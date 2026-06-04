import "@sellspace/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  allowedDevOrigins: ['192.168.100.61', '192.168.1.9'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-e3987c0eabed48adada47ada313dfa7b.r2.dev',
        pathname: '/:path*',
      },
    ],
  },
  headers: async () => {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
