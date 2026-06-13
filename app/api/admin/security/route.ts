import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession, hashPassword } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword, username } = await request.json();
    
    if (!currentPassword) {
      return NextResponse.json({ error: 'Current password is required' }, { status: 400 });
    }

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    // Verify current password
    const admin = db.instance.prepare('SELECT * FROM admins WHERE id = ?').get(session.id) as any;
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const match = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!match) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    if (newPassword) {
      // Hash new password
      const newHash = await hashPassword(newPassword);
      // Update password
      db.instance.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(newHash, session.id);
    }

    if (username && username !== admin.username) {
      // Only super_admin can update username
      if (admin.admin_role === 'super_admin') {
        const existing = db.getAdminByUsername(username);
        if (existing && existing.id !== session.id) {
          return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }
        db.instance.prepare('UPDATE admins SET username = ? WHERE id = ?').run(username, session.id);
      } else {
        return NextResponse.json({ error: 'Only super admin can change username' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
