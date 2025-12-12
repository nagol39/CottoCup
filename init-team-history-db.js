const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'players.db');
const db = new Database(dbPath);

console.log('Creating player_team_history table...');

// Create team history table
db.exec(`
  CREATE TABLE IF NOT EXISTS player_team_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    team TEXT NOT NULL CHECK(team IN ('USA','Europe')),
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE(player_id, year)
  )
`);

console.log('✓ player_team_history table created');

// Get all players and all years from matches
const players = db.prepare('SELECT id, name, team FROM players').all();
const years = db.prepare('SELECT DISTINCT year FROM matches ORDER BY year').all();

console.log('\nPopulating team history with current team assignments...');

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO player_team_history (player_id, year, team)
  VALUES (?, ?, ?)
`);

let recordsAdded = 0;

// For each player, assign their current team to all years
players.forEach(player => {
  years.forEach(({ year }) => {
    insertStmt.run(player.id, year, player.team);
    recordsAdded++;
  });
  console.log(`✓ Added team history for ${player.name} (${player.team})`);
});

console.log(`\n✅ Team history initialized! Added ${recordsAdded} records.`);
console.log('\nNote: All players have been assigned their current team for all years.');
console.log('Use the admin interface to adjust team assignments for specific years if needed.');

db.close();
