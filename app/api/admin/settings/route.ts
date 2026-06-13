import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = db.getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  try {
    const { hashPassword, getSession, verifyPassword } = await import('@/lib/auth');
    const data = await request.json();

    // Handle password change
    if (data.current_password && data.new_password) {
      const session = await getSession();
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const admin = db.getAdminByUsername(session.username as string);
      if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
      const valid = await verifyPassword(data.current_password, admin.password_hash);
      if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      const hash = await hashPassword(data.new_password);
      db.updateAdminPassword(admin.id, hash);
      return NextResponse.json({ success: true, message: 'Password updated' });
    }

    // Handle settings update
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        db.updateSetting(key, value as string);
      }
      // Revalidate the entire layout to apply site_status and global settings changes immediately
      revalidatePath('/', 'layout');
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'No valid data provided' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
