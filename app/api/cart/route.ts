import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ items: [], count: 0 });
    const items = db.getCartItems(session.id);
    const count = db.getCartCount(session.id);
    return NextResponse.json({ items, count });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    const body = await request.json();
    const { product_id, quantity } = body;
    if (!product_id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    const product = db.getProduct(product_id) as { min_order_quantity: number } | undefined;
    const minQty = product?.min_order_quantity || 1;
    const finalQty = Math.max(minQty, quantity || minQty);
    
    db.addToCart(session.id, product_id, finalQty);
    const count = db.getCartCount(session.id);
    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    if (error.type === 'STOCK_EXCEEDED') {
      return NextResponse.json({ error: `Only ${error.available} left in stock`, type: 'STOCK_EXCEEDED', available: error.available }, { status: 400 });
    }
    if (error.type === 'PRODUCT_NOT_FOUND') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    const body = await request.json();
    const { product_id, quantity } = body;
    if (!product_id) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    
    const product = db.getProduct(product_id) as { min_order_quantity: number } | undefined;
    const minQty = product?.min_order_quantity || 1;
    const finalQty = quantity <= 0 ? 0 : Math.max(minQty, quantity);
    
    db.updateCartQuantity(session.id, product_id, finalQty);
    const items = db.getCartItems(session.id);
    const count = db.getCartCount(session.id);
    return NextResponse.json({ success: true, items, count });
  } catch (error: any) {
    if (error.type === 'STOCK_EXCEEDED') {
      return NextResponse.json({ error: `Only ${error.available} left in stock`, type: 'STOCK_EXCEEDED', available: error.available }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getUserSession();
    if (!session) return NextResponse.json({ error: 'Please login first' }, { status: 401 });
    const { product_id } = await request.json();
    db.removeFromCart(session.id, product_id);
    const items = db.getCartItems(session.id);
    const count = db.getCartCount(session.id);
    return NextResponse.json({ success: true, items, count });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}
