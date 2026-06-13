import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function GET() {
  const brands = db.getBrands();
  return NextResponse.json({ brands });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name || !data.image) return NextResponse.json({ error: 'Name and image are required' }, { status: 400 });
    const result = db.createBrand(data);
    revalidatePath('/');
    revalidatePath('/api/brands');
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch {
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    db.deleteBrand(id);
    revalidatePath('/');
    revalidatePath('/api/brands');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
