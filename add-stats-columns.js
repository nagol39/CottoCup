const Database = require('better-sqlite3');
const db = new Database('./data/players.db');

try {
  console.log('Adding statistics columns to players table...');

  // Add new columns
  db.exec(`
    ALTER TABLE players ADD COLUMN total_points REAL DEFAULT 0.0;
  `);
  console.log('✓ Added total_points column');

  db.exec(`
    ALTER TABLE players ADD COLUMN results_wld TEXT DEFAULT '0-0-0';
  `);
  console.log('✓ Added results_wld column');

  db.exec(`
    ALTER TABLE players ADD COLUMN singles TEXT DEFAULT '0-0-0';
  `);
  console.log('✓ Added singles column');

  db.exec(`
    ALTER TABLE players ADD COLUMN scramble TEXT DEFAULT '0-0-0';
  `);
  console.log('✓ Added scramble column');

  db.exec(`
    ALTER TABLE players ADD COLUMN four_ball TEXT DEFAULT '0-0-0';
  `);
  console.log('✓ Added four_ball column');

  db.exec(`
    ALTER TABLE players ADD COLUMN foursomes TEXT DEFAULT '0-0-0';
  `);
  console.log('✓ Added foursomes column');

  db.exec(`
    ALTER TABLE players ADD COLUMN tip_n_rip TEXT DEFAULT '0-0-0';
  `);
  console.log('✓ Added tip_n_rip column');

  db.exec(`
    ALTER TABLE players ADD COLUMN matches_won INTEGER DEFAULT 0;
  `);
  console.log('✓ Added matches_won column');

  db.exec(`
    ALTER TABLE players ADD COLUMN matches_played INTEGER DEFAULT 0;
  `);
  console.log('✓ Added matches_played column');

  db.exec(`
    ALTER TABLE players ADD COLUMN win_percentage REAL DEFAULT 0.0;
  `);
  console.log('✓ Added win_percentage column');

  db.exec(`
    ALTER TABLE players ADD COLUMN handicap_18 REAL DEFAULT 0.0;
  `);
  console.log('✓ Added handicap_18 column');

  db.exec(`
    ALTER TABLE players ADD COLUMN handicap_9 REAL DEFAULT 0.0;
  `);
  console.log('✓ Added handicap_9 column');

  console.log('\n✅ All statistics columns added successfully!');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
} finally {
  db.close();
}
