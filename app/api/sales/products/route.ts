import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSalesRepSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSalesRepSession();
    if (!session || !session.sales_rep_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = db.instance.prepare(`
      SELECT 
        id, name, slug, price, retailer_price, category, 
        stock, is_active, sku, commission_eligible 
      FROM products 
      WHERE is_active = 1 
      ORDER BY category ASC, name ASC
    `).all();

    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
