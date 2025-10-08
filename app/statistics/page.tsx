import React from 'react';
import Link from 'next/link';
import Database from 'better-sqlite3';
import path from 'path';

export default function StatisticsPage() {
  const dbPath = path.join(process.cwd(), 'data', 'players.db');
  const db = new Database(dbPath);

  const teamUSA = db.prepare("SELECT * FROM players WHERE team = 'USA'").all();
  const teamEurope = db.prepare("SELECT * FROM players WHERE team = 'Europe'").all();

  db.close();

  return (
    <div className="p-8 bg-white text-black min-h-screen">
      <h1 className="text-4xl font-extrabold mb-6 text-center">Ryder Cup Statistics</h1>

      {/* Overall wins */}
      <div className="flex justify-around mb-10">
        <div className="text-center border-4 border-red-600 rounded-xl p-4 w-40 bg-red-50">
          <h2 className="text-2xl font-bold text-red-600">Team USA</h2>
          <p className="text-xl font-semibold text-black">8 Wins</p>
        </div>
        <div className="text-center border-4 border-blue-600 rounded-xl p-4 w-40 bg-blue-50">
          <h2 className="text-2xl font-bold text-blue-600">Team Europe</h2>
          <p className="text-xl font-semibold text-black">0 Wins</p>
        </div>
      </div>

      {/* Player lists */}
      <div className="grid grid-cols-2 gap-8">
        {/* Team USA */}
        <div>
          <h3 className="text-xl font-semibold text-red-600 mb-3">Team USA Players</h3>
          <div className="space-y-4">
            {teamUSA.map((player: any) => (
              <Link
                key={player.id}
                href={`/players/${player.slug}`}
                className="block p-4 bg-red-100 border border-red-400 rounded-xl text-black hover:bg-red-200 transition"
              >
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-24 h-24 rounded-full mb-2 border-2 border-red-600"
                />
                <p className="font-bold">{player.name}</p>
                <p>Handicap: {player.handicap}</p>
                <p>Handedness: {player.handedness}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Team Europe */}
        <div>
          <h3 className="text-xl font-semibold text-blue-600 mb-3">Team Europe Players</h3>
          <div className="space-y-4">
            {teamEurope.map((player: any) => (
              <Link
                key={player.id}
                href={`/players/${player.slug}`}
                className="block p-4 bg-blue-100 border border-blue-400 rounded-xl text-black hover:bg-blue-200 transition"
              >
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-24 h-24 rounded-full mb-2 border-2 border-blue-600"
                />
                <p className="font-bold">{player.name}</p>
                <p>Handicap: {player.handicap}</p>
                <p>Handedness: {player.handedness}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
