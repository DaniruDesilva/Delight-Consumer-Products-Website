import { NextResponse } from 'next/server';
import { getAuthAdmin } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(req: Request) {
  const admin = await getAuthAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const url = new URL(req.url);
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    // For now, assume the logged in admin is a sales rep
    // In a real scenario, we'd get the sales_rep_id from the admin.id
    const rep = db.getSalesReps().find((r: any) => r.admin_id === admin.id);
    if (!rep) return NextResponse.json({ error: 'Sales Rep profile not found' }, { status: 404 });

    const visits = db.getVisitsByDate(rep.id, date);
    return NextResponse.json({ visits, date });
  } catch (error: any) {
    console.error('Error fetching routes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAuthAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const { retailer_ids, planned_date } = body;

    if (!retailer_ids || !planned_date || !Array.isArray(retailer_ids)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rep = db.getSalesReps().find((r: any) => r.admin_id === admin.id);
    if (!rep) return NextResponse.json({ error: 'Sales Rep profile not found' }, { status: 404 });

    // Create visits for each retailer
    for (const retailer_id of retailer_ids) {
      db.createVisit(rep.id, parseInt(retailer_id), planned_date);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating route:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
