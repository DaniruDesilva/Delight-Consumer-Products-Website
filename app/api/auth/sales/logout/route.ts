import { NextResponse } from 'next/server';
import { clearSalesRepSessionCookie } from '@/lib/auth';

export async function POST() {
  await clearSalesRepSessionCookie();
  return NextResponse.json({ success: true });
}
