import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(request: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });
  const { name, phone } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  db.instance.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(name.trim(), phone || '', session.id);
  return NextResponse.json({ success: true });
}
