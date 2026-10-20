import { NextResponse } from 'next/server';
import { getAuthAdmin } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const admin = await getAuthAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (admin.admin_role !== 'super_admin' && !admin.permissions?.includes('manage_sales')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const sales_rep_id = searchParams.get('sales_rep_id');
  const date = searchParams.get('date');

  if (!sales_rep_id || !date) {
    return NextResponse.json({ error: 'sales_rep_id and date are required' }, { status: 400 });
  }

  try {
    const visits = db.getVisitsByDate(parseInt(sales_rep_id), date);
    return NextResponse.json({ success: true, data: visits });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAuthAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (admin.admin_role !== 'super_admin' && !admin.permissions?.includes('manage_sales')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { sales_rep_id, planned_date, retailer_ids } = await req.json();

    if (!sales_rep_id || !planned_date || !Array.isArray(retailer_ids)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if these visits already exist for the rep and date
    const existingVisits = db.getVisitsByDate(sales_rep_id, planned_date);
    const existingRetailerIds = existingVisits.map((v: any) => v.retailer_id);

    const addedCount = 0;
    for (const rid of retailer_ids) {
      if (!existingRetailerIds.includes(rid)) {
        // Pass is_admin_assigned = 1
        db.createVisit(sales_rep_id, rid, planned_date, 1);
      }
    }

    return NextResponse.json({ success: true, message: 'Route assigned successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
