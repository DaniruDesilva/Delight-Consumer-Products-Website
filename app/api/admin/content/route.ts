import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || undefined;
  const content = db.getContent(page);
  return NextResponse.json({ content });
}

export async function PUT(request: Request) {
  try {
    const { items } = await request.json();
    const affectedPages = new Set<string>();

    if (Array.isArray(items)) {
      for (const item of items) {
        if (item.id) {
          db.updateContent(item.id, item.content_value);
        } else if (item.page && item.section && item.content_key) {
          db.upsertContent(item.page, item.section, item.content_key, item.content_value, item.content_type || 'text');
        }
        // Track which pages were updated for targeted revalidation
        if (item.page) affectedPages.add(item.page);
      }
    }

    // Revalidate all known content pages so changes appear immediately
    const pageRoutes: Record<string, string> = {
      home: '/',
      about: '/about',
      contact: '/contact',
      terms: '/terms',
      privacy: '/privacy',
      legal: '/legal',
      careers: '/careers',
    };

    for (const page of affectedPages) {
      if (pageRoutes[page]) revalidatePath(pageRoutes[page]);
    }
    // Also revalidate the public content API
    revalidatePath('/api/content');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
