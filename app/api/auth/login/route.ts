import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createToken, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }
    const admin = db.getAdminByUsername(username);
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    if (admin.is_active === 0) {
      return NextResponse.json({ error: 'Account disabled. Please contact a super admin.' }, { status: 403 });
    }
    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    let parsedPermissions: string[] = [];
    try {
      parsedPermissions = JSON.parse(admin.permissions || '[]');
    } catch {}

    const token = await createToken({ 
      id: admin.id, 
      username: admin.username, 
      role: 'admin',
      admin_role: admin.admin_role,
      permissions: parsedPermissions
    });
    await setSessionCookie(token);
    return NextResponse.json({ success: true, user: { id: admin.id, username: admin.username, email: admin.email, admin_role: admin.admin_role, permissions: parsedPermissions } });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
