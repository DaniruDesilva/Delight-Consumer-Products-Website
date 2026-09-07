import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!canManageSales(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const rep = db.getSalesRepById(parseInt(id));
    if (!rep) {
      return NextResponse.json({ error: 'Sales rep not found' }, { status: 404 });
    }

    const stats = db.getSalesRepStats(rep.id);
    return NextResponse.json({ success: true, data: { ...rep, ...stats } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!canManageSales(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const repId = parseInt(id);
    const rep = db.getSalesRepById(repId);
    if (!rep) {
      return NextResponse.json({ error: 'Sales rep not found' }, { status: 404 });
    }

    const body = await request.json();
    const { full_name, phone, territory, base_salary, max_discount_percent, status, employee_code, password, email } = body;

    // Update sales_reps record
    db.updateSalesRep(repId, {
      full_name: full_name !== undefined ? full_name : rep.full_name,
      phone: phone !== undefined ? phone : rep.phone,
      territory: territory !== undefined ? territory : rep.territory,
      base_salary: base_salary !== undefined ? base_salary : rep.base_salary,
      max_discount_percent: max_discount_percent !== undefined ? max_discount_percent : rep.max_discount_percent,
      status: status !== undefined ? status : rep.status,
      employee_code: employee_code !== undefined ? employee_code : rep.employee_code,
    });

    // Update admin account if needed
    if (password) {
      const hash = bcrypt.hashSync(password, 10);
      db.updateAdminPassword(rep.admin_id, hash);
    }
    if (email !== undefined) {
      db.updateAdmin(rep.admin_id, {
        username: rep.username,
        email: email,
        admin_role: 'sales_rep',
        permissions: '[]',
        is_active: status === 'inactive' ? 0 : 1,
      });
    }
    if (status !== undefined) {
      db.updateAdmin(rep.admin_id, {
        username: rep.username,
        email: rep.email,
        admin_role: 'sales_rep',
        permissions: '[]',
        is_active: status === 'inactive' ? 0 : 1,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!canManageSales(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const repId = parseInt(id);
    const rep = db.getSalesRepById(repId);
    if (!rep) {
      return NextResponse.json({ error: 'Sales rep not found' }, { status: 404 });
    }

    // Deactivate instead of hard delete
    db.updateSalesRep(repId, { status: 'inactive' });
    db.updateAdmin(rep.admin_id, {
      username: rep.username,
      email: rep.email,
      admin_role: 'sales_rep',
      permissions: '[]',
      is_active: 0,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
