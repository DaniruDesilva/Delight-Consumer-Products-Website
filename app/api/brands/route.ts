import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiCache, TTL } from '@/lib/cache';

export const revalidate = 300;

export async function GET() {
  const cacheKey = 'brands:active';
  const cached = apiCache.get<object>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  const brands = db.getBrands(true);
  const response = { brands };
  apiCache.set(cacheKey, response, TTL.LONG);

  return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' } });
}
