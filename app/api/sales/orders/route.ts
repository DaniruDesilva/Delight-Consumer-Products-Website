import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSalesRepSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSalesRepSession();
    if (!session || !session.sales_rep_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const retailer_id = searchParams.get('retailer_id');

    const opts: any = { sales_rep_id: session.sales_rep_id };
    if (retailer_id) opts.retailer_id = parseInt(retailer_id);

    const orders = db.getSalesOrders(opts);

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSalesRepSession();
    if (!session || !session.sales_rep_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      retailer_id, 
      items, 
      subtotal, 
      discount_total, 
      total, 
      payment_method,
      notes 
    } = body;

    if (!retailer_id || !items || !items.length || total === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the retailer belongs to this sales rep (or is an active retailer)
    const retailer = db.getRetailerById(retailer_id);
    if (!retailer || retailer.sales_rep_id !== session.sales_rep_id) {
      return NextResponse.json({ error: 'Invalid retailer' }, { status: 403 });
    }

    const order_number = db.getNextSalesOrderNumber();
    const items_json = JSON.stringify(items);
    
    // Check if discount needs manager approval (e.g., > max_discount_percent of the rep)
    const rep = db.getSalesRepById(session.sales_rep_id);
    const maxDiscountAllowed = rep.max_discount_percent || 5;
    const discountPercent = subtotal > 0 ? (discount_total / subtotal) * 100 : 0;
    
    const requires_approval = discountPercent > maxDiscountAllowed ? 1 : 0;
    const initial_status = requires_approval ? 'pending_approval' : 'completed'; // If it doesn't need approval, we can mark it completed or pending delivery based on business logic. Let's use 'completed' for direct sales, or 'pending' if it needs delivery. Let's use 'pending'.
    
    const result = db.createSalesOrder({
      order_number,
      sales_rep_id: session.sales_rep_id,
      retailer_id,
      items_json,
      subtotal,
      discount_total,
      total,
      payment_method: payment_method || 'credit',
      requires_approval,
      notes,
      status: initial_status === 'pending_approval' ? 'pending_approval' : 'pending'
    });

    // We only update retailer stats if the order is confirmed/completed, but the updateRetailerSalesStats helper 
    // considers all orders NOT IN ('cancelled', 'rejected'). So even 'pending' counts towards outstanding.
    db.updateRetailerSalesStats(retailer_id);

    return NextResponse.json({ 
      success: true, 
      order_number,
      requires_approval
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
