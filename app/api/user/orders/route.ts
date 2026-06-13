import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  const orders = db.getUserOrders(session.id);
  const returns = db.getUserReturns(session.id);
  return NextResponse.json({ orders, returns });
}
