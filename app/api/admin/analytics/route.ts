import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Session Metrics
    const sessionStats = db.instance.prepare(`
      SELECT 
        COUNT(id) as total_visitors,
        AVG(duration) as avg_duration,
        SUM(page_views) as total_page_views
      FROM analytics_sessions
    `).get() as any;

    // 2. User & Conversion Metrics
    const usersCount = db.instance.prepare('SELECT COUNT(id) as count FROM users').get() as any;
    const customersCount = db.instance.prepare('SELECT COUNT(DISTINCT user_id) as count FROM orders WHERE user_id IS NOT NULL').get() as any;
    const totalOrders = db.instance.prepare('SELECT COUNT(id) as count FROM orders').get() as any;
    const revenueStat = db.instance.prepare("SELECT SUM(total) as revenue FROM orders WHERE status NOT IN ('cancelled', 'returned')").get() as any;

    const registeredUsers = usersCount?.count || 0;
    const buyingCustomers = customersCount?.count || 0;
    const conversionRate = registeredUsers > 0 ? ((buyingCustomers / registeredUsers) * 100).toFixed(1) : 0;

    // 3. Device Types
    const devices = db.instance.prepare(`
      SELECT device_type, COUNT(id) as count 
      FROM analytics_sessions 
      GROUP BY device_type
    `).all();

    // 4. Sales Trends (last 7 days)
    const salesTrend = db.instance.prepare(`
      SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(id) as orders
      FROM orders
      WHERE created_at >= date('now', '-7 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all();

    return NextResponse.json({
      metrics: {
        totalVisitors: sessionStats.total_visitors || 0,
        avgDurationSeconds: Math.round(sessionStats.avg_duration || 0),
        totalPageViews: sessionStats.total_page_views || 0,
        registeredUsers,
        buyingCustomers,
        conversionRate,
        totalOrders: totalOrders.count || 0,
        totalRevenue: revenueStat.revenue || 0,
      },
      devices,
      salesTrend
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
