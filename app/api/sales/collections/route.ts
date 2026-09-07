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

    const collections = db.getCollections(opts);

    return NextResponse.json({ collections });
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
      amount, 
      payment_method, 
      reference_number, 
      notes 
    } = body;

    if (!retailer_id || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Valid retailer and positive amount required' }, { status: 400 });
    }

    // Verify the retailer belongs to this sales rep (or is an active retailer)
    const retailer = db.getRetailerById(retailer_id);
    if (!retailer || retailer.sales_rep_id !== session.sales_rep_id) {
      return NextResponse.json({ error: 'Invalid retailer' }, { status: 403 });
    }

    const result = db.createCollection({
      sales_rep_id: session.sales_rep_id,
      retailer_id,
      amount,
      payment_method: payment_method || 'cash',
      reference_number: reference_number || '',
      notes: notes || ''
    });

    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
