import Database from 'better-sqlite3';
import path from 'path';

function getDb() {
  const dbPath = path.join(process.cwd(), 'data', 'history.db');
  const db = new Database(dbPath);
  // ensure table
  db.prepare(
    `CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER UNIQUE,
      us_score TEXT,
      eu_score TEXT,
      location TEXT,
      us_players TEXT,
      eu_players TEXT,
      notes TEXT
    )`
  ).run();
  return db;
}

export async function GET() {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM history ORDER BY year DESC').all();
  db.close();
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json' } });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { year, us_score, eu_score, location, us_players, eu_players, notes } = body;
  const db = getDb();
  const stmt = db.prepare('INSERT INTO history (year, us_score, eu_score, location, us_players, eu_players, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(year, us_score || null, eu_score || null, location || null, JSON.stringify(us_players || []), JSON.stringify(eu_players || []), notes || '');
  db.close();
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, year, us_score, eu_score, location, us_players, eu_players, notes } = body;
  const db = getDb();
  const stmt = db.prepare('UPDATE history SET year=?, us_score=?, eu_score=?, location=?, us_players=?, eu_players=?, notes=? WHERE id=?');
  stmt.run(year, us_score || null, eu_score || null, location || null, JSON.stringify(us_players || []), JSON.stringify(eu_players || []), notes || '', id);
  db.close();
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  const db = getDb();
  db.prepare('DELETE FROM history WHERE id=?').run(id);
  db.close();
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
