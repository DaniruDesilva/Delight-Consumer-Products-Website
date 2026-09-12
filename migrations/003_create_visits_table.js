const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/delight.db');
const db = new Database(dbPath);

console.log('Running migration 003: Create visits table');

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sales_rep_id INTEGER NOT NULL,
      retailer_id INTEGER NOT NULL,
      planned_date DATE NOT NULL,
      status TEXT DEFAULT 'planned', -- 'planned', 'completed', 'cancelled'
      check_in_time DATETIME,
      check_in_lat REAL,
      check_in_lng REAL,
      check_out_time DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(sales_rep_id) REFERENCES sales_reps(id),
      FOREIGN KEY(retailer_id) REFERENCES retailers(id)
    );
  `);
  console.log('Migration successful: visits table created.');
} catch (err) {
  console.error('Migration failed:', err);
}
