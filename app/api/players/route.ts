import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
  const dbPath = path.join(process.cwd(), 'data', 'players.db');
  const db = new Database(dbPath);

  // Get all players with their most recent team from team_history
  const players = db.prepare(`
    SELECT 
      p.*,
      (
        SELECT team 
        FROM player_team_history th 
        WHERE th.player_id = p.id 
        ORDER BY th.year DESC 
        LIMIT 1
      ) as team
    FROM players p
  `).all();

  // Separate into teams
  const teamUSA = players.filter((p: any) => p.team === 'USA');
  const teamEurope = players.filter((p: any) => p.team === 'Europe');

  db.close();

  return new Response(JSON.stringify({ teamUSA, teamEurope }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
