import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';

const BASE_URL = 'https://www.delightconsumerproducts.lk';

// Static pages that are always part of the sitemap
const staticPages: MetadataRoute.Sitemap = [
  { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
  { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/careers`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  { url: `${BASE_URL}/returns`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/track-order`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  { url: `${BASE_URL}/legal`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // ─── Products ───────────────────────────────────────────────────────────────
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const products = db.instance
      .prepare("SELECT id, slug, name, updated_at FROM products WHERE status = 'active' AND slug IS NOT NULL AND slug != ''")
      .all() as { id: number; slug: string; name: string; updated_at: string }[];

    productUrls = products.map(p => ({
      url: `${BASE_URL}/shop/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // DB not available at build time — skip dynamic products
  }

  // ─── Product Info Pages ──────────────────────────────────────────────────────
  let productInfoUrls: MetadataRoute.Sitemap = [];
  try {
    const cards = db.instance
      .prepare('SELECT slug, created_at FROM product_info_cards WHERE is_active = 1')
      .all() as { slug: string; created_at: string }[];

    productInfoUrls = cards.map(card => ({
      url: `${BASE_URL}/products/${card.slug}`,
      lastModified: card.created_at ? new Date(card.created_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {
    // DB not available — skip
  }

  // ─── News Articles ───────────────────────────────────────────────────────────
  let newsUrls: MetadataRoute.Sitemap = [];
  try {
    const articles = db.instance
      .prepare("SELECT slug, published_at, updated_at FROM news_articles WHERE status = 'active'")
      .all() as { slug: string; published_at: string; updated_at: string }[];

    newsUrls = articles.map(a => ({
      url: `${BASE_URL}/news/${a.slug}`,
      lastModified: a.updated_at ? new Date(a.updated_at) : new Date(a.published_at),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch {
    // DB not available — skip
  }

  // ─── Careers / Job Listings ──────────────────────────────────────────────────
  let jobUrls: MetadataRoute.Sitemap = [];
  try {
    const jobs = db.instance
      .prepare("SELECT id, updated_at FROM jobs WHERE status = 'open'")
      .all() as { id: number; updated_at: string }[];

    jobUrls = jobs.map(j => ({
      url: `${BASE_URL}/careers/${j.id}`,
      lastModified: j.updated_at ? new Date(j.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));
  } catch {
    // DB not available — skip
  }

  return [
    ...staticPages,
    ...productUrls,
    ...productInfoUrls,
    ...newsUrls,
    ...jobUrls,
  ];
}
