import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    // Only update is_active for simplicity, or could allow full updates
    if (data.is_active !== undefined) {
      db.instance.prepare('UPDATE coupons SET is_active = ? WHERE id = ?').run(data.is_active ? 1 : 0, id);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    db.instance.prepare('DELETE FROM coupons WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
