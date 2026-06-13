import { NextResponse } from 'next/server';
import { getUserSession, hashPassword, verifyPassword } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PUT(request: Request) {
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Login required' }, { status: 401 });

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
  }

  // Get current user from DB to get the password hash
  const user = db.instance.prepare('SELECT password_hash FROM users WHERE id = ?').get(session.id) as { password_hash?: string } | undefined;
  
  if (!user || !user.password_hash) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Verify current password
  const isValid = await verifyPassword(currentPassword, user.password_hash);
  if (!isValid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  }

  // Hash new password and update
  const newHash = await hashPassword(newPassword);
  db.instance.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, session.id);

  return NextResponse.json({ success: true, message: 'Password updated successfully' });
}
