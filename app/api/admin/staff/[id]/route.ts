import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = db.getAdminById(session.id);
    if (!adminUser || adminUser.admin_role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, email, password, admin_role, permissions, is_active } = await request.json();
    const resolvedParams = await props.params;
    const id = parseInt(resolvedParams.id, 10);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 });
    }

    const targetAdmin = db.getAdminById(id);
    if (!targetAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    if (username && username !== targetAdmin.username) {
      const existingAdmin = db.getAdminByUsername(username);
      const existingUserByName = db.instance.prepare('SELECT id FROM users WHERE name = ?').get(username);
      if ((existingAdmin && existingAdmin.id !== id) || existingUserByName) {
        return NextResponse.json({ error: 'Username is already taken by a staff member or customer' }, { status: 400 });
      }
    }

    if (email && email !== targetAdmin.email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
      }
      const existingAdminByEmail = db.instance.prepare('SELECT id FROM admins WHERE email = ?').get(email) as any;
      const existingUserByEmail = db.getUserByEmail(email);
      if ((existingAdminByEmail && existingAdminByEmail.id !== id) || existingUserByEmail) {
        return NextResponse.json({ error: 'Email is already taken by a staff member or customer' }, { status: 400 });
      }
    }

    if (password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return NextResponse.json({ error: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.' }, { status: 400 });
      }
    }

    const perms = Array.isArray(permissions) ? JSON.stringify(permissions) : targetAdmin.permissions;

    db.updateAdmin(id, {
      username: username || targetAdmin.username,
      email: email || targetAdmin.email,
      admin_role: admin_role === 'super_admin' ? 'super_admin' : 'admin',
      permissions: perms,
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : targetAdmin.is_active
    });

    if (password) {
      db.updateAdminPassword(id, bcrypt.hashSync(password, 10));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = db.getAdminById(session.id);
    if (!adminUser || adminUser.admin_role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await props.params;
    const id = parseInt(resolvedParams.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid admin ID' }, { status: 400 });
    }

    if (session.id === id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    db.deleteAdmin(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
