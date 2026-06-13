import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const requests = db.getAllReturnRequests();
    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, status } = await request.json();
    db.updateReturnStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update return' }, { status: 500 });
  }
}
