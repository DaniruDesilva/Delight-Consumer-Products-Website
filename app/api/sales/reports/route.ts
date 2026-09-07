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
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    const opts: any = { sales_rep_id: session.sales_rep_id };
    if (date_from) opts.date_from = date_from;
    if (date_to) opts.date_to = date_to;

    const reports = db.getDailyReports(opts);

    return NextResponse.json({ reports });
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
      report_date, 
      territory, 
      shops_planned, 
      shops_visited, 
      orders_count, 
      new_retailers,
      total_sales,
      total_collections,
      new_leads,
      problems,
      market_feedback
    } = body;

    if (!report_date) {
      return NextResponse.json({ error: 'Report date is required' }, { status: 400 });
    }

    const result = db.createDailyReport({
      sales_rep_id: session.sales_rep_id,
      report_date,
      territory: territory || '',
      shops_planned: parseInt(shops_planned) || 0,
      shops_visited: parseInt(shops_visited) || 0,
      orders_count: parseInt(orders_count) || 0,
      new_retailers: parseInt(new_retailers) || 0,
      total_sales: parseFloat(total_sales) || 0,
      total_collections: parseFloat(total_collections) || 0,
      new_leads: parseInt(new_leads) || 0,
      problems: problems || '',
      market_feedback: market_feedback || ''
    });

    return NextResponse.json({ 
      success: true,
      message: 'Daily report submitted successfully'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
