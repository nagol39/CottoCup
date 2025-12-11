import Database from 'better-sqlite3';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const dbPath = path.join(process.cwd(), 'data', 'players.db');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get('year');

  const db = new Database(dbPath);

  if (year) {
    // Get matches for specific year with player names
    const matches = db.prepare(`
      SELECT 
        m.id,
        m.year,
        m.match_number,
        m.game_type,
        m.result,
        m.team1_player1_id,
        m.team1_player2_id,
        m.team2_player1_id,
        m.team2_player2_id,
        p1.name as team1_player1_name,
        p2.name as team1_player2_name,
        p3.name as team2_player1_name,
        p4.name as team2_player2_name
      FROM matches m
      LEFT JOIN players p1 ON m.team1_player1_id = p1.id
      LEFT JOIN players p2 ON m.team1_player2_id = p2.id
      LEFT JOIN players p3 ON m.team2_player1_id = p3.id
      LEFT JOIN players p4 ON m.team2_player2_id = p4.id
      WHERE m.year = ?
      ORDER BY m.match_number, m.game_type
    `).all(year);
    
    db.close();
    return NextResponse.json(matches);
  }

  // Get all matches when no year specified
  const allMatches = db.prepare(`
    SELECT 
      m.id,
      m.year,
      m.match_number,
      m.game_type,
      m.result,
      m.team1_player1_id,
      m.team1_player2_id,
      m.team2_player1_id,
      m.team2_player2_id,
      p1.name as team1_player1_name,
      p2.name as team1_player2_name,
      p3.name as team2_player1_name,
      p4.name as team2_player2_name
    FROM matches m
    LEFT JOIN players p1 ON m.team1_player1_id = p1.id
    LEFT JOIN players p2 ON m.team1_player2_id = p2.id
    LEFT JOIN players p3 ON m.team2_player1_id = p3.id
    LEFT JOIN players p4 ON m.team2_player2_id = p4.id
    ORDER BY m.year DESC, m.match_number, m.game_type
  `).all();

  db.close();
  return NextResponse.json(allMatches);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { year, match_number, game_type, team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id, result } = body;

  const db = new Database(dbPath);

  const info = db.prepare(`
    INSERT INTO matches (year, match_number, game_type, team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id, result)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(year, match_number, game_type, team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id, result);

  db.close();

  return NextResponse.json({ success: true, id: info.lastInsertRowid });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, year, match_number, game_type, team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id, result } = body;

  const db = new Database(dbPath);

  db.prepare(`
    UPDATE matches 
    SET year = ?, match_number = ?, game_type = ?, team1_player1_id = ?, team1_player2_id = ?, team2_player1_id = ?, team2_player2_id = ?, result = ?
    WHERE id = ?
  `).run(year, match_number, game_type, team1_player1_id, team1_player2_id, team2_player1_id, team2_player2_id, result, id);

  db.close();

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { id, match_number, year } = body;

  const db = new Database(dbPath);

  if (match_number && year) {
    // Delete all games for this match
    db.prepare('DELETE FROM matches WHERE match_number = ? AND year = ?').run(match_number, year);
  } else if (id) {
    // Delete single game
    db.prepare('DELETE FROM matches WHERE id = ?').run(id);
  }

  db.close();

  return NextResponse.json({ success: true });
}
