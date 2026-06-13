import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiCache, TTL } from '@/lib/cache';

export const revalidate = 60;

// Public endpoint — serves products for the shop page
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const featured = searchParams.get('featured');
  const category = searchParams.get('category') || undefined;
  const search = searchParams.get('search') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

  // Build cache key from query params
  const cacheKey = `products:f=${featured ?? '0'}:c=${category ?? 'all'}:s=${search ?? ''}:l=${limit ?? 'all'}`;
  const cached = apiCache.get<object>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  let products;
  if (featured === '1') {
    products = db.instance
      .prepare('SELECT * FROM products WHERE is_featured = 1 AND status = ? ORDER BY created_at DESC LIMIT ?')
      .all('active', limit || 8);
  } else {
    products = db.getProducts({ category, search, limit });
  }

  const categories = db.getCategories();
  const response = { products, categories };

  // Don't cache search results, cache everything else
  if (!search) {
    apiCache.set(cacheKey, response, TTL.MEDIUM);
  }

  return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' } });
}
