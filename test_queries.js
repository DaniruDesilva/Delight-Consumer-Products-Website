const dbPath = 'data/delight.db';
const Database = require('better-sqlite3');
const db = new Database(dbPath);

try {
  const sessionStats = db.prepare(`
    SELECT 
      COUNT(id) as total_visitors,
      AVG(duration) as avg_duration,
      SUM(page_views) as total_page_views
    FROM analytics_sessions
  `).get();
  console.log('Session stats ok');

  const usersCount = db.prepare('SELECT COUNT(id) as count FROM users').get();
  console.log('Users count ok');

  const customersCount = db.prepare('SELECT COUNT(DISTINCT user_id) as count FROM orders WHERE user_id IS NOT NULL').get();
  console.log('Customers count ok');

  const totalOrders = db.prepare('SELECT COUNT(id) as count FROM orders').get();
  console.log('Total orders ok');

  const revenueStat = db.prepare('SELECT SUM(total) as revenue FROM orders WHERE status NOT IN ("cancelled", "returned")').get();
  console.log('Revenue stat ok');

  const devices = db.prepare(`
    SELECT device_type, COUNT(id) as count 
    FROM analytics_sessions 
    GROUP BY device_type
  `).all();
  console.log('Devices ok');

  const salesTrend = db.prepare(`
    SELECT DATE(created_at) as date, SUM(total) as revenue, COUNT(id) as orders
    FROM orders
    WHERE created_at >= date('now', '-7 days')
    GROUP BY DATE(created_at)
    ORDER BY date ASC
  `).all();
  console.log('Sales trend ok');

} catch (err) {
  console.error("Query Error:", err);
}
