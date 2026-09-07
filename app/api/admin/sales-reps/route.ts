import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Helper: check if user can manage sales
function canManageSales(session: any) {
  if (!session || session.role !== 'admin') return false;
  const admin = db.getAdminById(session.id);
  if (!admin) return false;
  if (admin.admin_role === 'super_admin' || admin.admin_role === 'sales_manager') return true;
  try {
    const perms = JSON.parse(admin.permissions || '[]');
    return perms.includes('manage_sales');
  } catch { return false; }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!canManageSales(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reps = db.getSalesReps();
    // Attach stats for each rep
    const data = (reps as any[]).map(rep => {
      const stats = db.getSalesRepStats(rep.id);
      return { ...rep, ...stats };
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!canManageSales(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, email, password, full_name, phone, territory, base_salary, max_discount_percent } = body;

    if (!username || !password || !full_name) {
      return NextResponse.json({ error: 'Username, password, and full name are required' }, { status: 400 });
    }

    // Check unique username
    const existingAdmin = db.getAdminByUsername(username);
    if (existingAdmin) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    // Check unique email
    if (email) {
      const existingByEmail = db.instance.prepare('SELECT id FROM admins WHERE email = ?').get(email);
      if (existingByEmail) {
        return NextResponse.json({ error: 'Email already taken' }, { status: 400 });
      }
    }

    // Create admin account with sales_rep role
    const password_hash = bcrypt.hashSync(password, 10);
    const adminResult = db.createAdmin({
      username,
      email: email || '',
      password_hash,
      admin_role: 'sales_rep',
      permissions: '[]',
    });

    const adminId = Number(adminResult.lastInsertRowid);

    // Create sales rep record
    const employee_code = db.getNextEmployeeCode();
    db.createSalesRep({
      admin_id: adminId,
      employee_code,
      full_name,
      phone: phone || '',
      territory: territory || '',
      base_salary: base_salary || 0,
      max_discount_percent: max_discount_percent !== undefined ? max_discount_percent : 5,
    });

    return NextResponse.json({ success: true, employee_code });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
