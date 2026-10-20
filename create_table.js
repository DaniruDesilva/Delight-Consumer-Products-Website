const db = require('better-sqlite3')('data/delight.db');
db.exec(`
CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sales_rep_id INTEGER NOT NULL,
    retailer_id INTEGER NOT NULL,
    planned_date TEXT NOT NULL,
    status TEXT DEFAULT 'planned',
    check_in_time TEXT,
    check_out_time TEXT,
    notes TEXT,
    is_admin_assigned INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_rep_id) REFERENCES sales_reps(id),
    FOREIGN KEY (retailer_id) REFERENCES retailers(id)
);
`);
console.log('Visits table ready.');
