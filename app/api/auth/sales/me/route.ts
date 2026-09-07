import { NextResponse } from 'next/server';
import { getSalesRepSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await getSalesRepSession();
  if (!session || !session.sales_rep_id) {
    return NextResponse.json({ salesRep: null });
  }

  const salesRep = db.getSalesRepById(session.sales_rep_id);
  if (!salesRep || salesRep.status !== 'active') {
    return NextResponse.json({ salesRep: null });
  }

  const stats = db.getSalesRepStats(salesRep.id);

  // Get current month target
  const currentMonth = new Date().toISOString().slice(0, 7);
  const targets = db.getSalesTargets({ sales_rep_id: salesRep.id, month: currentMonth });
  const target = targets.length > 0 ? targets[0] as any : null;

  return NextResponse.json({
    salesRep: {
      id: salesRep.id,
      admin_id: salesRep.admin_id,
      employee_code: salesRep.employee_code,
      full_name: salesRep.full_name,
      phone: salesRep.phone,
      territory: salesRep.territory,
      username: salesRep.username,
      email: salesRep.email,
      ...stats,
      targetAmount: target?.target_amount || 0,
      targetAchievement: target?.target_amount ? Math.round((stats.monthlySales / target.target_amount) * 1000) / 10 : 0,
    }
  });
}
