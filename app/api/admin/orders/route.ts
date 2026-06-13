import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const orders = db.getOrders(status);
  return NextResponse.json({ orders });
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    db.updateOrderStatus(id, status);
    
    if (status === 'delivered') {
      db.instance.prepare('UPDATE orders SET delivered_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
