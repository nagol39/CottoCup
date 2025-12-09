import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
  const dbPath = path.join(process.cwd(), 'data', 'players.db');
  const db = new Database(dbPath);
  const players = db.prepare('SELECT * FROM players').all();
  db.close();
  return new Response(JSON.stringify(players), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { name, team, handedness, handicap, photo, bio } = body;

  // Generate slug from name (lowercase, replace spaces with hyphens)
  const slug = name ? name.trim().toLowerCase().replace(/\s+/g, '-') : '';

  // Set default photo if not provided
  let photoFilename = photo;
  if (!photoFilename) {
    photoFilename = team === 'Europe' ? 'eu1.jpg' : 'us1.jpg';
  }

  const dbPath = path.join(process.cwd(), 'data', 'players.db');
  const db = new Database(dbPath);
  db.prepare(
    'INSERT INTO players (name, slug, photo, team, handedness, handicap, bio) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(name, slug, photoFilename, team, handedness, handicap, bio || '');
  db.close();

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, name, team, handedness, handicap, photo, bio } = body;

  const dbPath = path.join(process.cwd(), 'data', 'players.db');
  const db = new Database(dbPath);
  db.prepare(
    'UPDATE players SET name=?, team=?, handedness=?, handicap=?, photo=?, bio=? WHERE id=?'
  ).run(name, team, handedness, handicap, photo, bio || '', id);
  db.close();

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();

  const dbPath = path.join(process.cwd(), 'data', 'players.db');
  const db = new Database(dbPath);
  db.prepare('DELETE FROM players WHERE id=?').run(id);
  db.close();

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
