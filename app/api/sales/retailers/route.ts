import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSalesRepSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSalesRepSession();
    if (!session || !session.sales_rep_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const retailers = db.instance.prepare(`
      SELECT * FROM retailers 
      WHERE sales_rep_id = ? 
      ORDER BY registered_at DESC
    `).all(session.sales_rep_id);

    return NextResponse.json({ retailers });
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
      business_name, 
      owner_name, 
      contact_number, 
      email, 
      address, 
      city, 
      district,
      location_lat,
      location_lng
    } = body;

    if (!business_name || !owner_name || !contact_number || !address || !city || !district) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const stmt = db.instance.prepare(`
      INSERT INTO retailers (
        sales_rep_id, shop_name, owner_name, phone, email, address, city, district, 
        gps_lat, gps_lng, credit_limit, outstanding_balance, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 'active')
    `);

    const result = stmt.run(
      session.sales_rep_id,
      business_name, // maps to shop_name
      owner_name,
      contact_number, // maps to phone
      email || null,
      address,
      city,
      district,
      location_lat || null, // maps to gps_lat
      location_lng || null  // maps to gps_lng
    );

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'A retailer with this contact number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
