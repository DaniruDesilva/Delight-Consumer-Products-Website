import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'all';

  const faqs = db.getFaqs(category);
  const categories = db.getFaqCategories();

  return NextResponse.json({ faqs, categories });
}
