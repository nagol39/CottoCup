const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'players.db');
const db = new Database(dbPath);

// Create game_formats table
db.exec(`
  CREATE TABLE IF NOT EXISTS game_formats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    rules TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
  )
`);

// Create rules_sections table
db.exec(`
  CREATE TABLE IF NOT EXISTS rules_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    rules TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0
  )
`);

// Insert default game formats if table is empty
const gameFormatCount = db.prepare('SELECT COUNT(*) as count FROM game_formats').get();
if (gameFormatCount.count === 0) {
  const insertFormat = db.prepare('INSERT INTO game_formats (title, description, rules, display_order) VALUES (?, ?, ?, ?)');
  
  insertFormat.run(
    'Two Man Scramble',
    'A team format where both players tee off, the team selects the preferred shot, and both players play their next shots from that selected position. The process repeats until the ball is holed.',
    JSON.stringify([
      'Team of two players; one score per hole for the team.',
      'Both players tee off on every hole; choose the best drive.',
      'Both players then play from the chosen spot (usually within one club length, no nearer the hole).',
      'Continue selecting the best shot until the ball is holed.',
      'Handicap strokes are applied according to the event rules.'
    ]),
    1
  );
  
  insertFormat.run(
    'Modified Alternate Shot',
    'A variation on traditional foursomes where both players tee off, the team selects the preferred tee shot, and players alternate shots from that point (the player who did not play the chosen tee shot plays the next shot).',
    JSON.stringify([
      'Both players tee off; pick the preferred tee shot for the team to play.',
      'The player who did not play the selected tee shot plays the next shot; alternate thereafter.',
      'Only one ball is in play for the team after the choice is made.',
      'Penalty strokes and local rules follow standard competition guidelines.'
    ]),
    2
  );
  
  insertFormat.run(
    'Tip it N\' Rip it',
    'A new and alternative version to alternate shot. One player will tee off from the Tips and the partner will tee off from the Reds. After that teams will choose which ball to play and begin alternating from this point on. The players will switch tee spots every hole.',
    JSON.stringify([
      'Both teammates tee off; One from the Tips the other from the Reds; choose the drive that gives the best scoring opportunity.',
      'Chosen drive becomes the ball in play for the team; Alternate shots are played from that position.',
      'Format rewards long, aggressive tee shots but teams must manage risk (penalties apply as usual).',
      'Scoring and handicap adjustments follow the event\'s published rules.'
    ]),
    3
  );
  
  console.log('✓ Default game formats inserted');
}

// Insert default rules sections if table is empty
const rulesCount = db.prepare('SELECT COUNT(*) as count FROM rules_sections').get();
if (rulesCount.count === 0) {
  const insertRule = db.prepare('INSERT INTO rules_sections (title, rules, display_order) VALUES (?, ?, ?)');
  
  insertRule.run(
    'General',
    JSON.stringify([
      'All players must follow the host course\'s local rules and the Committee\'s instructions.',
      'Play in the spirit of the game: safety, pace of play, and respect for other groups are required.',
      'Tees, fairways, greens and hazards are played as marked in the event notice.'
    ]),
    1
  );
  
  insertRule.run(
    'Scoring',
    JSON.stringify([
      'Each team records one score per hole unless otherwise noted by the format.',
      'If a hole is cancelled for the entire field, it will be excluded from the total score.',
      'Scorecards must be signed and submitted to the Committee by the end of play; failure to do so may result in disqualification.'
    ]),
    2
  );
  
  insertRule.run(
    'Handicaps',
    JSON.stringify([
      'Handicap strokes are applied according to the event\'s published handicap allocation method.',
      'In team formats, the allocation of strokes between partners follows the Committee\'s published rules for that format.',
      'Players are responsible for ensuring their handicap is correct prior to starting play.'
    ]),
    3
  );
  
  insertRule.run(
    'Penalties & Responsibility',
    JSON.stringify([
      'Standard Rules of Golf penalties apply (stroke, loss of hole, or disqualification as appropriate).',
      'Any rules questions should be referred to the Committee immediately; decisions of the Committee are final.',
      'Course damage (e.g., unattended carts causing harm) may result in penalty per Committee determination.'
    ]),
    4
  );
  
  insertRule.run(
    'Etiquette & Pace of Play',
    JSON.stringify([
      'Keep up with the group ahead; allow faster groups to play through when requested.',
      'Repair divots and ball marks and rake bunkers after use.',
      'Use ready golf when appropriate to help maintain pace of play.'
    ]),
    5
  );
  
  console.log('✓ Default rules sections inserted');
}

db.close();
console.log('\n✅ Game format database initialized successfully!');
