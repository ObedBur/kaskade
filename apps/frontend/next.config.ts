import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      // Ajouté pour permettre le chargement d'images depuis le backend en production
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_BACKEND_HOSTNAME || "**",
        pathname: "/uploads/**",
      },
    ],
  },
  output: 'standalone',
  outputFileTracingRoot: __dirname,
};

export default nextConfig;                         