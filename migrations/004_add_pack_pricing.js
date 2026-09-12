const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/delight.db');
const db = new Database(dbPath);

console.log('Running migration 004: Add pack size and bulk pricing json to products');

try {
  db.exec('ALTER TABLE products ADD COLUMN pack_size INTEGER DEFAULT 1');
  console.log('Added pack_size column');
} catch (e) {
  if (e.message.includes('duplicate column name')) {
    console.log('Column pack_size already exists');
  } else {
    console.error('Failed to add pack_size column:', e);
  }
}

try {
  db.exec('ALTER TABLE products ADD COLUMN bulk_pricing_json TEXT DEFAULT "[]"');
  console.log('Added bulk_pricing_json column');
} catch (e) {
  if (e.message.includes('duplicate column name')) {
    console.log('Column bulk_pricing_json already exists');
  } else {
    console.error('Failed to add bulk_pricing_json column:', e);
  }
}

console.log('Migration completed.');
