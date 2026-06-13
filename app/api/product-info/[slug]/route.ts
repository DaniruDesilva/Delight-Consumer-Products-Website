import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = db.getProductInfoBySlug(slug);
  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ card });
}
