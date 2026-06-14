const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'delight.db');
const db = new Database(dbPath);

const cards = db.prepare('SELECT id, detail_content FROM product_info_cards').all();
const updateStmt = db.prepare('UPDATE product_info_cards SET detail_content = ? WHERE id = ?');

for (const card of cards) {
  if (card.detail_content) {
    let content = card.detail_content;
    content = content.replace(/<h2>/gi, '## ');
    content = content.replace(/<\/h2>/gi, '\n\n');
    content = content.replace(/<p>/gi, '');
    content = content.replace(/<\/p>/gi, '\n\n');
    updateStmt.run(content.trim(), card.id);
  }
}

console.log('Successfully converted HTML to Markdown in the database!');
