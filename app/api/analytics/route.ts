import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { sessionId, deviceType, event, durationIncrement } = data;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    // Upsert session
    const existing = db.instance.prepare('SELECT id, duration, page_views FROM analytics_sessions WHERE session_id = ?').get(sessionId) as any;

    if (existing) {
      if (event === 'ping') {
        const inc = durationIncrement || 0;
        db.instance.prepare('UPDATE analytics_sessions SET duration = duration + ?, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?').run(inc, sessionId);
      } else if (event === 'pageview') {
        db.instance.prepare('UPDATE analytics_sessions SET page_views = page_views + 1, updated_at = CURRENT_TIMESTAMP WHERE session_id = ?').run(sessionId);
      }
    } else {
      const initDuration = event === 'ping' ? (durationIncrement || 0) : 0;
      const initViews = event === 'pageview' ? 1 : 0;
      
      db.instance.prepare(`
        INSERT INTO analytics_sessions (session_id, duration, page_views, device_type)
        VALUES (?, ?, ?, ?)
      `).run(sessionId, initDuration, initViews, deviceType || 'unknown');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Failed to record analytics' }, { status: 500 });
  }
}
