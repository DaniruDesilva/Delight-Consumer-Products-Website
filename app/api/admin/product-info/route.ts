import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function GET() {
  const cards = db.getProductInfoCards();
  return NextResponse.json({ cards });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.title || !data.image || !data.slug) return NextResponse.json({ error: 'Title, image and slug are required' }, { status: 400 });
    const result = db.createProductInfoCard(data);
    revalidatePath('/api/product-info');
    if (data.slug) {
      revalidatePath(`/products/${data.slug}`);
      revalidatePath(`/shop/${data.slug}`);
    }
    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch {
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    if (!data.id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    db.updateProductInfoCard(data.id, data);
    revalidatePath('/api/product-info');
    if (data.slug) {
      revalidatePath(`/products/${data.slug}`);
      revalidatePath(`/shop/${data.slug}`);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    db.deleteProductInfoCard(id);
    revalidatePath('/api/product-info');
    // We cannot easily get the slug here to revalidate the specific product page without an extra DB lookup,
    // but the API route revalidation will ensure the client fetches the new list.
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 });
  }
}
