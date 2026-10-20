import { NextResponse } from 'next/server';
import { getSalesRepSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const session = await getSalesRepSession();
  if (!session || !session.sales_rep_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    const visits = db.getVisitsByDate(session.sales_rep_id, date);
    return NextResponse.json({ visits, date });
  } catch (error: any) {
    console.error('Error fetching routes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSalesRepSession();
  if (!session || !session.sales_rep_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { retailer_ids, planned_date } = body;

    if (!retailer_ids || !planned_date || !Array.isArray(retailer_ids)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create visits for each retailer
    for (const retailer_id of retailer_ids) {
      db.createVisit(session.sales_rep_id, parseInt(retailer_id), planned_date);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
