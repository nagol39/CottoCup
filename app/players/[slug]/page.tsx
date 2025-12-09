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
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Left Column - Photo and Basic Info */}
          <div className="md:w-1/3">
            <img 
              src={`/photos/players/${player.photo}`} 
              alt={player.name} 
              className="w-full aspect-square object-cover rounded-lg shadow-lg mb-4" 
            />
            <h1 className="text-3xl font-bold mb-4">{player.name}</h1>
            <div className="space-y-2">
              <p><strong>Team:</strong> {player.team}</p>
              <p><strong>Handedness:</strong> {player.handedness}</p>
              <p><strong>Handicap:</strong> {player.handicap}</p>
              {player.handicap_18 > 0 && <p><strong>18 Hole Handicap:</strong> {player.handicap_18}</p>}
              {player.handicap_9 > 0 && <p><strong>9 Hole Handicap:</strong> {player.handicap_9}</p>}
            </div>
          </div>

          {/* Right Column - Stats and Bio */}
          <div className="md:w-2/3">
            {/* Statistics Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 border-b-2 border-blue-600 pb-2">Statistics</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Points</p>
                  <p className="text-2xl font-bold text-blue-600">{player.total_points || 0}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Win Percentage</p>
                  <p className="text-2xl font-bold text-blue-600">{player.win_percentage || 0}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Overall Record</h3>
                  <div className="space-y-2">
                    <p><strong>Results (W-L-D):</strong> {player.results_wld || '0-0-0'}</p>
                    <p><strong>Matches Won:</strong> {player.matches_won || 0}</p>
                    <p><strong>Matches Played:</strong> {player.matches_played || 0}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Game Format Records</h3>
                  <div className="space-y-2">
                    <p><strong>Singles:</strong> {player.singles || '0-0-0'}</p>
                    <p><strong>Scramble:</strong> {player.scramble || '0-0-0'}</p>
                    <p><strong>Four-Ball:</strong> {player.four_ball || '0-0-0'}</p>
                    <p><strong>Foursomes:</strong> {player.foursomes || '0-0-0'}</p>
                    <p><strong>Tip N Rip:</strong> {player.tip_n_rip || '0-0-0'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {player.bio && (
              <div>
                <h2 className="text-2xl font-bold mb-4 border-b-2 border-blue-600 pb-2">About</h2>
                <p className="text-gray-700 leading-relaxed">{player.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
