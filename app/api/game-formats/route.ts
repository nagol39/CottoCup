import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'players.db');

export async function GET() {
  const db = new Database(dbPath);
  const formats = db.prepare('SELECT * FROM game_formats ORDER BY display_order').all();
  db.close();
  
  return NextResponse.json(formats.map(f => ({
    ...f,
    rules: JSON.parse(f.rules)
  })));
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, rules, display_order } = body;
  
  const db = new Database(dbPath);
  const result = db.prepare(
    'INSERT INTO game_formats (title, description, rules, display_order) VALUES (?, ?, ?, ?)'
  ).run(title, description, JSON.stringify(rules), display_order || 0);
  
  db.close();
  
  return NextResponse.json({ id: result.lastInsertRowid });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { id, title, description, rules, display_order } = body;
  
  const db = new Database(dbPath);
  db.prepare(
    'UPDATE game_formats SET title = ?, description = ?, rules = ?, display_order = ? WHERE id = ?'
  ).run(title, description, JSON.stringify(rules), display_order, id);
  
  db.close();
  
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  const db = new Database(dbPath);
  db.prepare('DELETE FROM game_formats WHERE id = ?').run(id);
  db.close();
  
  return NextResponse.json({ success: true });
}
