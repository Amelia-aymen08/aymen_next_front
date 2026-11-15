import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serveur autonome (.next/standalone) : compilé en local, copié sur le VPS, lancé avec PM2.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  // Le dossier parent (E:\aymen-immobilier-v2) contient un autre package-lock.json.
  turbopack: { root: path.resolve(__dirname) },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "backend.aymenpromotion-dz.com" },
      { protocol: "https", hostname: "strapi.aymenpromotion-dz.com" },
      { protocol: "http", hostname: "localhost", port: "5000" },
    ],
  },
};

export default nextConfig;
