import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createToken, setSalesRepSessionCookie } from '@/lib/auth';

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

    // Must be a sales_rep role
    if (admin.admin_role !== 'sales_rep') {
      return NextResponse.json({ error: 'This login is for sales representatives only' }, { status: 403 });
    }

    if (admin.is_active === 0) {
      return NextResponse.json({ error: 'Account disabled. Please contact your manager.' }, { status: 403 });
    }

    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Get sales rep record
    const salesRep = db.getSalesRepByAdminId(admin.id);
    if (!salesRep) {
      return NextResponse.json({ error: 'Sales representative profile not found. Please contact admin.' }, { status: 404 });
    }

    if (salesRep.status !== 'active') {
      return NextResponse.json({ error: 'Your sales representative account is inactive.' }, { status: 403 });
    }

    const token = await createToken({
      id: admin.id,
      username: admin.username,
      role: 'sales_rep',
      admin_role: 'sales_rep',
      sales_rep_id: salesRep.id,
    });

    await setSalesRepSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        sales_rep_id: salesRep.id,
        employee_code: salesRep.employee_code,
        full_name: salesRep.full_name,
        territory: salesRep.territory,
      }
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
