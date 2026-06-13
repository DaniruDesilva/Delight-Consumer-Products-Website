import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ items: [] });
  const items = db.getWishlist(session.id);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  const { product_id } = await request.json();
  const added = db.toggleWishlist(session.id, product_id);
  return NextResponse.json({ added });
}
