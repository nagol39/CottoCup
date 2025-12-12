import Database from 'better-sqlite3';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const dbPath = path.join(process.cwd(), 'data', 'players.db');

// GET - Fetch team history for a player or all team history
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const playerId = searchParams.get('player_id');
  
  const db = new Database(dbPath);
  
  if (playerId) {
    // Get team history for specific player
    const history = db.prepare(`
      SELECT th.*, p.name as player_name
      FROM player_team_history th
      JOIN players p ON th.player_id = p.id
      WHERE th.player_id = ?
      ORDER BY th.year DESC
    `).all(playerId);
    
    db.close();
    return NextResponse.json(history);
  } else {
    // Get all team history
    const history = db.prepare(`
      SELECT th.*, p.name as player_name
      FROM player_team_history th
      JOIN players p ON th.player_id = p.id
      ORDER BY p.name, th.year DESC
    `).all();
    
    db.close();
    return NextResponse.json(history);
  }
}

// POST - Add team assignment for a player/year
export async function POST(req: Request) {
  const body = await req.json();
  const { player_id, year, team } = body;
  
  const db = new Database(dbPath);
  
  try {
    db.prepare(`
      INSERT INTO player_team_history (player_id, year, team)
      VALUES (?, ?, ?)
    `).run(player_id, year, team);
    
    db.close();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    db.close();
    if (error.message.includes('UNIQUE constraint')) {
      return NextResponse.json({ error: 'Team assignment already exists for this player/year' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update team assignment
export async function PUT(req: Request) {
  const body = await req.json();
  const { id, player_id, year, team } = body;
  
  const db = new Database(dbPath);
  
  db.prepare(`
    UPDATE player_team_history
    SET player_id = ?, year = ?, team = ?
    WHERE id = ?
  `).run(player_id, year, team, id);
  
  db.close();
  return NextResponse.json({ success: true });
}

// DELETE - Remove team assignment
export async function DELETE(req: Request) {
  const body = await req.json();
  const { id } = body;
  
  const db = new Database(dbPath);
  
  db.prepare('DELETE FROM player_team_history WHERE id = ?').run(id);
  
  db.close();
  return NextResponse.json({ success: true });
}
