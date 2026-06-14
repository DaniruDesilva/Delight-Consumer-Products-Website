import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiCache, TTL } from '@/lib/cache';

// Next.js route cache — revalidate every 5 minutes on the server
export const revalidate = 300;

export async function GET() {
  const cacheKey = 'settings:public';
  const cached = apiCache.get<object>(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  const settings = db.getSettings();

  // Expose only non-sensitive global settings to frontend
  const publicSettings = {
    site_name: settings.site_name,
    site_tagline: settings.site_tagline,
    contact_phone: settings.contact_phone,
    contact_email: settings.contact_email,
    whatsapp: settings.whatsapp,
    facebook: settings.facebook,
    tiktok: settings.tiktok,
    youtube: settings.youtube,
    free_shipping_threshold: settings.free_shipping_threshold,
    show_brands_section: settings.show_brands_section ?? '1',
  };

  const response = { settings: publicSettings };
  apiCache.set(cacheKey, response, TTL.LONG);

  return NextResponse.json(response, {
    headers: { 'X-Cache': 'MISS' },
  });
}
