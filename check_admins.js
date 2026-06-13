const Database = require('better-sqlite3');
const db = new Database('./data/delight.db', { fileMustExist: true });
const admins = db.prepare('SELECT id, username, email, admin_role, permissions FROM admins').all();
console.log(JSON.stringify(admins, null, 2));
