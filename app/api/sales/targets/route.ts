import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSalesRepSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSalesRepSession();
    if (!session || !session.sales_rep_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7); // e.g. "2026-09"

    // 1. Fetch Sales Target for the month
    const targets = db.getSalesTargets({ sales_rep_id: session.sales_rep_id, month });
    const target = targets.length > 0 ? targets[0] : null;

    // 2. Fetch Actual Sales achieved this month
    const stats = db.getSalesRepStats(session.sales_rep_id);

    // 3. Fetch Commission Tiers
    const commissionTiers = db.getCommissionTiers() as any[];

    // Calculate Estimated Commission based on Monthly Sales
    let estimatedCommission = 0;
    let currentTier = null;
    let nextTier = null;

    const achievedSales = stats.monthlySales;

    for (let i = 0; i < commissionTiers.length; i++) {
      const tier = commissionTiers[i];
      if (achievedSales >= tier.min_sales) {
        currentTier = tier;
        estimatedCommission = achievedSales * (tier.commission_percent / 100);
        if (i < commissionTiers.length - 1) {
          nextTier = commissionTiers[i + 1];
        } else {
          nextTier = null; // Top tier reached
        }
      } else if (!currentTier) {
        nextTier = tier; // Haven't reached first tier yet
        break;
      }
    }

    // 4. Fetch past commission records
    const commissionHistory = db.getCommissionRecords({ sales_rep_id: session.sales_rep_id });

    return NextResponse.json({ 
      month,
      target,
      stats,
      commissionTiers,
      estimatedCommission,
      currentTier,
      nextTier,
      commissionHistory
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
