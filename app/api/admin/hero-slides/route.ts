import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { apiCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  const slides = db.getHeroSlides();
  return NextResponse.json({ slides });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.image) return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    const result = db.createHeroSlide(data);
    apiCache.invalidate('hero-slides');
    revalidatePath('/');
    revalidatePath('/api/hero-slides');
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch {
    return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    if (!data.id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    db.updateHeroSlide(data.id, data);
    apiCache.invalidate('hero-slides');
    revalidatePath('/');
    revalidatePath('/api/hero-slides');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    db.deleteHeroSlide(id);
    apiCache.invalidate('hero-slides');
    revalidatePath('/');
    revalidatePath('/api/hero-slides');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
  }
}
