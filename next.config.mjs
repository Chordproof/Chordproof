/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default;

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

module.exports = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: false,
  // Cache offline: shell do app + páginas de cifra visitadas + assets estáticos.
  workbox: {
    runtimeCaching: [
      {
        // Páginas de cifra: network-first, cai para cache offline
        urlPattern: ({ url }) =>
          url.pathname.startsWith("/tab/") || url.pathname.startsWith("/artist/") || url.pathname.startsWith("/genre/"),
        handler: "NetworkFirst",
        options: {
          cacheName: "chordproof-tabs",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 14 },
        },
      },
      {
        // Imagens de artistas e assets do Supabase
        urlPattern: ({ url }) => url.hostname.endsWith("supabase.co"),
        handler: "CacheFirst",
        options: {
          cacheName: "chordproof-images",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
    ],
  },
  extendDefaultRuntimeCaching: true,
})(nextConfig);
