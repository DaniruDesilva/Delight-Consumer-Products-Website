import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSalesRepSession } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSalesRepSession();
    if (!session || !session.sales_rep_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const retailer = db.instance.prepare(`
      SELECT * FROM retailers 
      WHERE id = ? AND sales_rep_id = ?
    `).get(id, session.sales_rep_id);

    if (!retailer) {
      return NextResponse.json({ error: 'Retailer not found' }, { status: 404 });
    }

    return NextResponse.json({ retailer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSalesRepSession();
    if (!session || !session.sales_rep_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      business_name, 
      owner_name, 
      contact_number, 
      email, 
      address, 
      city, 
      district,
      location_lat,
      location_lng,
      status
    } = body;

    if (!business_name || !owner_name || !contact_number || !address || !city || !district) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stmt = db.instance.prepare(`
      UPDATE retailers SET 
        shop_name = ?, 
        owner_name = ?, 
        phone = ?, 
        email = ?, 
        address = ?, 
        city = ?, 
        district = ?, 
        gps_lat = ?, 
        gps_lng = ?,
        status = ?
      WHERE id = ? AND sales_rep_id = ?
    `);

    const result = stmt.run(
      business_name,
      owner_name,
      contact_number,
      email || null,
      address,
      city,
      district,
      location_lat || null,
      location_lng || null,
      status || 'active',
      id,
      session.sales_rep_id
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Retailer not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'A retailer with this contact number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await getSalesRepSession();
    if (!session || !session.sales_rep_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if retailer has any orders or collections
    // If they do, soft delete them instead of hard delete
    const hasOrders = db.instance.prepare('SELECT id FROM sales_orders WHERE retailer_id = ? LIMIT 1').get(id);
    const hasCollections = db.instance.prepare('SELECT id FROM collections WHERE retailer_id = ? LIMIT 1').get(id);

    if (hasOrders || hasCollections) {
      // Soft delete
      db.instance.prepare('UPDATE retailers SET status = ? WHERE id = ? AND sales_rep_id = ?').run('inactive', id, session.sales_rep_id);
    } else {
      // Hard delete
      db.instance.prepare('DELETE FROM retailers WHERE id = ? AND sales_rep_id = ?').run(id, session.sales_rep_id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
