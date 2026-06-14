import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiCache, TTL } from '@/lib/cache';

export const revalidate = 60;

export async function GET() {
  const cacheKey = 'categories:enriched';
  const cached = apiCache.get<object>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  const categories = db.getCategories();
  
  const settingsObj = db.getSettings();
  const catImagesStr = settingsObj['category_images'];
  const category_images = catImagesStr ? JSON.parse(catImagesStr) : {};

  // For each category, get a representative product image
  const enriched = categories.map((cat: { category: string }) => {
    let image = category_images[cat.category];
    if (!image) {
      const product = db.instance
        .prepare('SELECT image FROM products WHERE category = ? AND status = ? LIMIT 1')
        .get(cat.category, 'active') as { image: string } | undefined;
      image = product?.image || 'https://res.cloudinary.com/dbvmfmob4/image/upload/v1779477142/delight_static/l3phgjchpgvmuxhdakp2.png';
    }
    return {
      name: cat.category,
      image,
    };
  });

  const response = { categories: enriched };
  apiCache.set(cacheKey, response, TTL.MEDIUM);

  return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' } });
}
