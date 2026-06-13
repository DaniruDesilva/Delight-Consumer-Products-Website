import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiCache, TTL } from '@/lib/cache';

export const revalidate = 300;

export async function GET() {
  const cacheKey = 'popup:settings';
  const cached = apiCache.get<object>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
  }

  const settings = db.getSettings();
  const response = {
    enabled: settings.popup_enabled === '1',
    title: settings.popup_title || '',
    description: settings.popup_description || '',
    image: settings.popup_image || '',
    link: settings.popup_link || '/shop',
    linkText: settings.popup_link_text || 'Shop Now',
    delaySeconds: parseInt(settings.popup_delay_seconds || '5'),
  };

  apiCache.set(cacheKey, response, TTL.LONG);
  return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' } });
}
