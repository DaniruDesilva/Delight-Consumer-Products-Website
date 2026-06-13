import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const coupons = db.getAllCoupons();
    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    
    // Validate required fields
    if (!data.code || !data.discount_type || data.discount_value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if code already exists
    const existing = db.instance.prepare('SELECT * FROM coupons WHERE code = ? COLLATE NOCASE').get(data.code);
    if (existing) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const result = db.createCoupon({
      ...data,
      expiry_date: data.expiry_date || null,
      usage_limit: data.usage_limit || null
    });

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}
