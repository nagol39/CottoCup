import { notFound } from 'next/navigation';
import path from 'path';
import Database from 'better-sqlite3';
import React from 'react';

export async function generateStaticParams() {
  const dbPath = path.join(process.cwd(), 'data', 'players.db');
  const db = new Database(dbPath);
  const players = db.prepare('SELECT slug FROM players').all();
  db.close();
  return players.map((player: any) => ({ slug: player.slug }));
}

export default async function PlayerPage({ params }: { params: { slug: string } }) {
  const dbPath = path.join(process.cwd(), 'data', 'players.db');
  const db = new Database(dbPath);
  const player = db.prepare('SELECT * FROM players WHERE slug = ?').get(params.slug);
  db.close();

  if (!player) return notFound();

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-3xl font-bold mb-4">{player.name}</h1>
      <img src={`/photos/players/${player.photo}`} alt={player.name} className="h-32 w-32 object-cover rounded-full mb-4" />
      <p><strong>Team:</strong> {player.team}</p>
      <p><strong>Handedness:</strong> {player.handedness}</p>
      <p><strong>Handicap:</strong> {player.handicap}</p>
      {player.bio && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <p className="text-gray-700">{player.bio}</p>
        </div>
      )}
    </div>
  );
}
