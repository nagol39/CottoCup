
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'players.db');
const dbExists = fs.existsSync(dbPath);

const db = new Database(dbPath);

if (!dbExists) {
  db.prepare(`
    CREATE TABLE players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      photo TEXT,
      handicap INTEGER,
      handedness TEXT,
      team TEXT CHECK(team IN ('USA','Europe'))
    )
  `).run();
  console.log('Database initialized!');
} else {
  console.log('Database already exists.');
}
