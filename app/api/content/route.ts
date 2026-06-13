import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Public endpoint — no auth required
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || undefined;
  const content = db.getContent(page);

  // Transform array into a nested object: { section: { key: value } }
  const structured: Record<string, Record<string, string>> = {};
  for (const item of content as { section: string; content_key: string; content_value: string }[]) {
    if (!structured[item.section]) structured[item.section] = {};
    structured[item.section][item.content_key] = item.content_value;
  }

  return NextResponse.json(structured);
}
