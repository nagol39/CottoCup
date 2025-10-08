import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
  const dbPath = path.join(process.cwd(), 'data', 'players.db');
  const db = new Database(dbPath);

  const teamUSA = db.prepare("SELECT * FROM players WHERE team = 'USA'").all();
  const teamEurope = db.prepare("SELECT * FROM players WHERE team = 'Europe'").all();

  db.close();

  return new Response(JSON.stringify({ teamUSA, teamEurope }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
