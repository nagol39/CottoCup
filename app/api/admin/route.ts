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
  
  db.close();
  return new Response(JSON.stringify(players), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { first_name, last_name, handedness, handicap, photo, bio, total_points, results_wld, singles, scramble, four_ball, foursomes, tip_n_rip, matches_won, matches_played, win_percentage, handicap_18, handicap_9 } = body;

  // Construct full name from first and last name
  const fullName = `${first_name} ${last_name}`.trim();
  
  // Generate slug from name (lowercase, replace spaces with hyphens)
  const slug = fullName ? fullName.trim().toLowerCase().replace(/\s+/g, '-') : '';

  // Set default photo if not provided
  let photoFilename = photo;
  if (!photoFilename) {
    photoFilename = 'us1.jpg';  // Default photo
  }

  const dbPath = path.join(process.cwd(), 'data', 'players.db');
  const db = new Database(dbPath);
  db.prepare(
    'INSERT INTO players (name, first_name, last_name, slug, photo, handedness, handicap, bio, total_points, results_wld, singles, scramble, four_ball, foursomes, tip_n_rip, matches_won, matches_played, win_percentage, handicap_18, handicap_9) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(fullName, first_name, last_name, slug, photoFilename, handedness, handicap, bio || '', total_points || 0, results_wld || '0-0-0', singles || '0-0-0', scramble || '0-0-0', four_ball || '0-0-0', foursomes || '0-0-0', tip_n_rip || '0-0-0', matches_won || 0, matches_played || 0, win_percentage || 0, handicap_18 || 0, handicap_9 || 0);
  db.close();

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, first_name, last_name, handedness, handicap, photo, bio, total_points, results_wld, singles, scramble, four_ball, foursomes, tip_n_rip, matches_won, matches_played, win_percentage, handicap_18, handicap_9 } = body;

  // Always construct full name from first and last name
  const fullName = `${first_name} ${last_name}`.trim();
  
  // Generate slug from name (lowercase, replace spaces with hyphens)
  const slug = fullName ? fullName.trim().toLowerCase().replace(/\s+/g, '-') : '';

  const dbPath = path.join(process.cwd(), 'data', 'players.db');
  const db = new Database(dbPath);
  db.prepare(
    'UPDATE players SET name=?, first_name=?, last_name=?, slug=?, handedness=?, handicap=?, photo=?, bio=?, total_points=?, results_wld=?, singles=?, scramble=?, four_ball=?, foursomes=?, tip_n_rip=?, matches_won=?, matches_played=?, win_percentage=?, handicap_18=?, handicap_9=? WHERE id=?'
  ).run(fullName, first_name, last_name, slug, handedness, handicap, photo, bio || '', total_points || 0, results_wld || '0-0-0', singles || '0-0-0', scramble || '0-0-0', four_ball || '0-0-0', foursomes || '0-0-0', tip_n_rip || '0-0-0', matches_won || 0, matches_played || 0, win_percentage || 0, handicap_18 || 0, handicap_9 || 0, id);
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
