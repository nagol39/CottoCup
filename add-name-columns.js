const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'players.db');
const db = new Database(dbPath);

console.log('Adding first_name and last_name columns to players table...');

try {
  // Add first_name column
  db.prepare('ALTER TABLE players ADD COLUMN first_name TEXT').run();
  console.log('✓ Added first_name column');
} catch (e) {
  if (e.message.includes('duplicate column name')) {
    console.log('✓ first_name column already exists');
  } else {
    throw e;
  }
}

try {
  // Add last_name column
  db.prepare('ALTER TABLE players ADD COLUMN last_name TEXT').run();
  console.log('✓ Added last_name column');
} catch (e) {
  if (e.message.includes('duplicate column name')) {
    console.log('✓ last_name column already exists');
  } else {
    throw e;
  }
}

// Migrate existing data: split name into first_name and last_name
console.log('\nMigrating existing player names...');
const players = db.prepare('SELECT id, name FROM players WHERE first_name IS NULL').all();

players.forEach(player => {
  const nameParts = player.name.trim().split(' ');
  let firstName = '';
  let lastName = '';
  
  if (nameParts.length === 1) {
    firstName = nameParts[0];
    lastName = '';
  } else if (nameParts.length === 2) {
    firstName = nameParts[0];
    lastName = nameParts[1];
  } else {
    // For names with more than 2 parts, assume first part is first name, rest is last name
    firstName = nameParts[0];
    lastName = nameParts.slice(1).join(' ');
  }
  
  db.prepare('UPDATE players SET first_name = ?, last_name = ? WHERE id = ?')
    .run(firstName, lastName, player.id);
  
  console.log(`✓ Migrated: ${player.name} -> ${firstName} ${lastName}`);
});

db.close();
console.log('\n✅ Migration complete!');
