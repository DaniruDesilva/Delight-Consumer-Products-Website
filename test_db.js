const db = require('better-sqlite3')('data/delight.db');
try {
  console.log(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='analytics_sessions'").get());
  const rows = db.prepare('SELECT * FROM analytics_sessions').all();
  console.log("analytics_sessions rows:", rows.length);
} catch (err) {
  console.error("DB Error:", err.message);
}
