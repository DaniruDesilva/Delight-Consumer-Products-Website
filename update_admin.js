const Database = require('better-sqlite3');
const db = new Database('./data/delight.db', { fileMustExist: true });
db.exec("UPDATE admins SET admin_role = 'super_admin' WHERE username = 'admin' OR id = 1");
const admins = db.prepare('SELECT id, username, email, admin_role, permissions FROM admins').all();
console.log(JSON.stringify(admins, null, 2));
