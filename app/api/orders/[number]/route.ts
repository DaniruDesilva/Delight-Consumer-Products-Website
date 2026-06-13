import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number: orderNumber } = await params;
  const { searchParams } = new URL(request.url);
  const identifier = searchParams.get('id'); // Email or Phone

  try {
    let order;
    if (identifier) {
      // Secure tracking check
      order = db.getOrderForTracking(orderNumber, identifier);
    } else {
      // Basic check for success page (less secure but order number is random)
      order = db.getOrderByNumber(orderNumber);
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Parse items
    order.items = JSON.parse(order.items_json || '[]');
    delete order.items_json;

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Fetch order error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}
