import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = 'https://www.delightconsumerproducts.lk';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/account',
          '/account/',
          '/cart',
          '/cart/',
          '/checkout',
          '/checkout/',
        ],
      },
      {
        // Explicitly allow Googlebot to crawl all assets
        userAgent: 'Googlebot',
        allow: ['/_next/static/', '/_next/image', '/'],
        disallow: ['/admin/', '/api/', '/account/', '/checkout/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
