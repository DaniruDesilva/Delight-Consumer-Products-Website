import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' }, { status: 400 });
    }

    // Verify token
    const resetRecord = db.instance.prepare('SELECT * FROM password_resets WHERE token = ?').get(token) as any;
    if (!resetRecord) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    if (new Date(resetRecord.expires_at) < new Date()) {
      db.instance.prepare('DELETE FROM password_resets WHERE id = ?').run(resetRecord.id);
      return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 });
    }

    // Update password
    const user = db.getUserByEmail(resetRecord.email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hashed = await hashPassword(password);
    db.instance.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashed, user.id);

    // Delete token so it can't be reused
    db.instance.prepare('DELETE FROM password_resets WHERE id = ?').run(resetRecord.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
