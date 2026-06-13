import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ user: null });
  const user = db.getUserById(session.id);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user });
}
