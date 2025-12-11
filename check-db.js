const Database = require('better-sqlite3');
const db = new Database('./data/players.db');

console.log('=== All Tables ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables);

console.log('\n=== Players Table Structure ===');
const playersCols = db.prepare('PRAGMA table_info(players)').all();
console.log(playersCols);

db.close();
