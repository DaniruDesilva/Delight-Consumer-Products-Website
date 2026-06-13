import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
  const slug = searchParams.get('slug');

  if (slug) {
    const article = db.getNewsBySlug(slug);
    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    return NextResponse.json(article);
  }

  const articles = db.getNewsArticles(limit);
  return NextResponse.json({ articles });
}
