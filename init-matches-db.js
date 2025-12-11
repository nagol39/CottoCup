const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'players.db');
const db = new Database(dbPath);

console.log('Creating matches table...');

// Create matches table to store individual match results
// Each match has 2 pairs (team1 and team2) playing 3 games
db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    game_type TEXT NOT NULL,
    team1_player1_id INTEGER,
    team1_player2_id INTEGER,
    team2_player1_id INTEGER,
    team2_player2_id INTEGER,
    result TEXT NOT NULL,
    FOREIGN KEY (team1_player1_id) REFERENCES players(id),
    FOREIGN KEY (team1_player2_id) REFERENCES players(id),
    FOREIGN KEY (team2_player1_id) REFERENCES players(id),
    FOREIGN KEY (team2_player2_id) REFERENCES players(id)
  )
`);

console.log('✓ Matches table created successfully!');
console.log('');
console.log('Table structure:');
console.log('- id: Match game ID (auto-increment)');
console.log('- year: Year of the tournament');
console.log('- match_number: Match number (1, 2, 3, etc.)');
console.log('- game_type: scramble, fourball, or foursomes');
console.log('- team1_player1_id, team1_player2_id: Pair for team 1 (USA)');
console.log('- team2_player1_id, team2_player2_id: Pair for team 2 (Europe)');
console.log('- result: W (team1 wins), L (team2 wins), D (draw)');
console.log('');
console.log('Each match will have 3 rows (one for each game type)');

db.close();
