import { NextResponse } from 'next/server';
import { getAuthAdmin } from '@/lib/auth';
import db from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const { status, check_in_time, check_out_time, notes } = body;

    db.updateVisitStatus(parseInt(id), status, check_in_time, check_out_time, notes);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating visit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAuthAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    db.deleteVisit(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting visit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
