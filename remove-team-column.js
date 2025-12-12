const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'players.db');
const db = new Database(dbPath);

console.log('Removing team column from players table...');
console.log('Note: SQLite does not support DROP COLUMN directly, so we need to recreate the table.');

// Get current schema
const players = db.prepare('SELECT * FROM players').all();

// Create new table without team column
db.exec(`
  CREATE TABLE players_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    slug TEXT NOT NULL,
    photo TEXT,
    handicap INTEGER,
    handedness TEXT,
    bio TEXT,
    total_points REAL DEFAULT 0.0,
    results_wld TEXT DEFAULT '0-0-0',
    singles TEXT DEFAULT '0-0-0',
    scramble TEXT DEFAULT '0-0-0',
    four_ball TEXT DEFAULT '0-0-0',
    foursomes TEXT DEFAULT '0-0-0',
    tip_n_rip TEXT DEFAULT '0-0-0',
    matches_won INTEGER DEFAULT 0,
    matches_played INTEGER DEFAULT 0,
    win_percentage REAL DEFAULT 0.0,
    handicap_18 REAL DEFAULT 0.0,
    handicap_9 REAL DEFAULT 0.0
  )
`);

// Copy data (excluding team column)
const insertStmt = db.prepare(`
  INSERT INTO players_new (
    id, name, first_name, last_name, slug, photo, handicap, handedness, bio,
    total_points, results_wld, singles, scramble, four_ball, foursomes, tip_n_rip,
    matches_won, matches_played, win_percentage, handicap_18, handicap_9
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

players.forEach(player => {
  insertStmt.run(
    player.id, player.name, player.first_name, player.last_name, player.slug,
    player.photo, player.handicap, player.handedness, player.bio,
    player.total_points, player.results_wld, player.singles, player.scramble,
    player.four_ball, player.foursomes, player.tip_n_rip, player.matches_won,
    player.matches_played, player.win_percentage, player.handicap_18, player.handicap_9
  );
});

// Drop old table and rename new one
db.exec('DROP TABLE players');
db.exec('ALTER TABLE players_new RENAME TO players');

console.log('✅ Team column removed from players table!');
console.log('All player data preserved.');
console.log('\nTeam information is now managed exclusively through player_team_history table.');

db.close();
