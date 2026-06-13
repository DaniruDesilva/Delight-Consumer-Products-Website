import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { apiCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
  const products = db.getProducts({ search, category, limit, offset });
  const total = db.getProductCount();
  const categories = db.getCategories();
  return NextResponse.json({ products, total, categories });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name || !data.price) {
      return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
    }
    const result = db.createProduct(data);
    const productId = Number(result.lastInsertRowid);
    // Save gallery images if provided
    if (data.gallery_images && Array.isArray(data.gallery_images) && data.gallery_images.length > 0) {
      db.setProductImages(productId, data.gallery_images);
    }
    apiCache.invalidate('products');
    apiCache.invalidate('categories');
    revalidatePath('/shop');
    revalidatePath('/api/products');
    revalidatePath('/');
    return NextResponse.json({ success: true, id: productId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
