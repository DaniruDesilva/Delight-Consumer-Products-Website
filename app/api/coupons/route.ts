import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    const coupon = db.getCouponByCode(code);

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 404 });
    }

    // Check expiry
    if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
      return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
    }

    // Check usage limits
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
    }

    // Check if current user has already used this coupon
    const session = await getUserSession();
    if (session) {
      const pastOrder = db.instance.prepare('SELECT id FROM orders WHERE user_id = ? AND coupon_code = ?').get(session.id, coupon.code);
      if (pastOrder) {
        return NextResponse.json({ error: 'You have already used this coupon' }, { status: 400 });
      }
    }

    // Check minimum spend
    if (subtotal < coupon.min_spend) {
      return NextResponse.json({ error: `Minimum spend of Rs. ${coupon.min_spend} required for this coupon` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value
      }
    });

  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}
