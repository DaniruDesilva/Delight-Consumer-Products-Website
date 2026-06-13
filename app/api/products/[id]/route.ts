import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Public endpoint: get a single product by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = db.getProduct(parseInt(id));
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json(product);
}
