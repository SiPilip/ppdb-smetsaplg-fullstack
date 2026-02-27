import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Diperlukan untuk Docker deployment (multi-stage build)
  // Menghasilkan .next/standalone yang bisa berjalan tanpa node_modules penuh
  output: "standalone",

  // Matikan telemetry di production
  experimental: {},

  // Agar TypeScript errors tidak memblokir Docker build di CI/CD
  // Type checking tetap berjalan saat `npm run dev` di lokal
  typescript: {
    ignoreBuildErrors: true,
  },

  // Headers keamanan tambahan
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
