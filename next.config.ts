import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── URL Normalization ───
  trailingSlash: false,

  // ─── Compression & Security ───
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  // ─── Image Optimization ───
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },

  // ─── Server-Side Native Modules ───
  serverExternalPackages: ['better-sqlite3', 'sharp'],

  // ─── Canonical Redirects ──────────────────────────────────────────────────
  async redirects() {
    return [
      // Enforce no trailing slash (301 permanent)
      { source: '/shop/', destination: '/shop', permanent: true },
      { source: '/about/', destination: '/about', permanent: true },
      { source: '/contact/', destination: '/contact', permanent: true },
      { source: '/news/', destination: '/news', permanent: true },
      { source: '/faq/', destination: '/faq', permanent: true },
      { source: '/careers/', destination: '/careers', permanent: true },
    ];
  },

  // ─── Security & Cache Headers ───
  async headers() {
    return [
      // Cache immutable Next.js static assets for 1 year
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Cache public images for 30 days
      {
        source: '/(:path*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      // Security headers on all pages
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
