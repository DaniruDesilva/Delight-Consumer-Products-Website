import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { apiCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = db.getProduct(parseInt(id));
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const gallery_images = db.getProductImages(parseInt(id));
  return NextResponse.json({ ...product, gallery_images });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const productId = parseInt(id);
    db.updateProduct(productId, data);
    if (data.gallery_images && Array.isArray(data.gallery_images)) {
      db.setProductImages(productId, data.gallery_images.map((img: string | { image_url: string }) => typeof img === 'string' ? img : img.image_url));
    }
    
    // Invalidate cache
    apiCache.invalidate('products');
    apiCache.invalidate('categories');
    revalidatePath('/shop');
    revalidatePath('/api/products');
    revalidatePath('/');
    if (data.slug) {
      revalidatePath(`/products/${data.slug}`);
      revalidatePath(`/shop/${data.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    db.deleteProduct(parseInt(id));
    
    apiCache.invalidate('products');
    apiCache.invalidate('categories');
    revalidatePath('/shop');
    revalidatePath('/api/products');
    revalidatePath('/');
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
