import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserSession } from '@/lib/auth';

export async function GET() {
  try {
    const allCoupons = db.getAllCoupons() as any[];
    const session = await getUserSession();
    
    const activeCoupons = allCoupons.filter(coupon => {
      if (!coupon.is_active) return false;
      if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) return false;
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return false;
      
      if (session) {
        const pastOrder = db.instance.prepare('SELECT id FROM orders WHERE user_id = ? AND coupon_code = ?').get(session.id, coupon.code);
        if (pastOrder) return false;
      }
      
      return true;
    });

    return NextResponse.json({ coupons: activeCoupons });
  } catch (error) {
    console.error('Error fetching active coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}
