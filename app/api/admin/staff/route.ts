import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = db.getAdminById(session.id);
    if (!adminUser || adminUser.admin_role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admins = db.getAllAdmins();
    return NextResponse.json({ success: true, data: admins });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = db.getAdminById(session.id);
    if (!adminUser || adminUser.admin_role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, email, password, admin_role, permissions } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (email && !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' }, { status: 400 });
    }

    // Check if username already exists in admins or users
    const existingAdmin = db.getAdminByUsername(username);
    const existingUserByName = db.instance.prepare('SELECT id FROM users WHERE name = ?').get(username);
    if (existingAdmin || existingUserByName) {
      return NextResponse.json({ error: 'Username is already taken by a staff member or customer' }, { status: 400 });
    }

    // Check if email already exists in admins or users
    if (email) {
      const existingAdminByEmail = db.instance.prepare('SELECT id FROM admins WHERE email = ?').get(email);
      const existingUserByEmail = db.getUserByEmail(email);
      if (existingAdminByEmail || existingUserByEmail) {
        return NextResponse.json({ error: 'Email is already taken by a staff member or customer' }, { status: 400 });
      }
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const perms = Array.isArray(permissions) ? JSON.stringify(permissions) : '[]';

    db.createAdmin({
      username,
      email: email || '',
      password_hash,
      admin_role: admin_role === 'super_admin' ? 'super_admin' : 'admin',
      permissions: perms
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
