import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSalesRepSession } from '@/lib/auth';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSalesRepSession();
    if (!session || !session.sales_rep_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const validStatuses = ['ready', 'delivered', 'cash_collected']; 
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Sales Reps can only update status to Ready, Delivered, or Cash Collected' }, { status: 403 });
    }

    // Verify order belongs to this sales rep
    const opts = { sales_rep_id: session.sales_rep_id };
    const orders = db.getSalesOrders(opts) as any[];
    const order = orders.find((o: any) => o.id === parseInt(id));

    if (!order) {
      return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 });
    }

    // Enforce state machine for Sales Rep (forward and backward)
    if (status === 'delivered' && !['ready', 'cash_collected'].includes(order.status)) {
       return NextResponse.json({ error: 'Invalid transition to Delivered' }, { status: 400 });
    }
    if (status === 'cash_collected' && order.status !== 'delivered') {
       return NextResponse.json({ error: 'Order must be Delivered before Cash is Collected' }, { status: 400 });
    }
    if (status === 'ready' && order.status !== 'delivered') {
       return NextResponse.json({ error: 'Can only revert to Ready from Delivered' }, { status: 400 });
    }

    db.updateSalesOrderStatus(parseInt(id), status);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
