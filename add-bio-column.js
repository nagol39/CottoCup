const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'players.db');
const db = new Database(dbPath);

try {
  // Add bio column to players table
  db.prepare('ALTER TABLE players ADD COLUMN bio TEXT').run();
  console.log('Successfully added bio column to players table');
} catch (error) {
  if (error.message.includes('duplicate column name')) {
    console.log('Bio column already exists');
  } else {
    console.error('Error adding bio column:', error);
  }
}

db.close();
