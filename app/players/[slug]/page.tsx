import { notFound } from 'next/navigation';
import path from 'path';
import Database from 'better-sqlite3';
import React from 'react';
import MatchHistory from '../../components/MatchHistory';

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
  const player = db.prepare('SELECT * FROM players WHERE slug = ?').get(params.slug) as any;

  if (!player) {
    db.close();
    return notFound();
  }

  // Get team history for this player
  const teamHistory = db.prepare(`
    SELECT year, team 
    FROM player_team_history 
    WHERE player_id = ?
    ORDER BY year DESC
  `).all(player.id) as any[];

  // Get all matches this player participated in
  const matches = db.prepare(`
    SELECT 
      m.*,
      p1.name as team1_player1_name,
      p2.name as team1_player2_name,
      p3.name as team2_player1_name,
      p4.name as team2_player2_name
    FROM matches m
    LEFT JOIN players p1 ON m.team1_player1_id = p1.id
    LEFT JOIN players p2 ON m.team1_player2_id = p2.id
    LEFT JOIN players p3 ON m.team2_player1_id = p3.id
    LEFT JOIN players p4 ON m.team2_player2_id = p4.id
    WHERE team1_player1_id = ? 
       OR team1_player2_id = ? 
       OR team2_player1_id = ? 
       OR team2_player2_id = ?
    ORDER BY m.year DESC, m.match_number, m.game_type
  `).all(player.id, player.id, player.id, player.id) as any[];

  // Get tournament history data (location and scores)
  const historyDbPath = path.join(process.cwd(), 'data', 'history.db');
  const historyDb = new Database(historyDbPath);
  const tournamentHistory = historyDb.prepare(`
    SELECT year, location, us_score, eu_score
    FROM history
    ORDER BY year DESC
  `).all() as any[];
  historyDb.close();

  db.close();

  // Calculate statistics from matches
  let totalPoints = 0;
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let matchesPlayed = matches.length;

  // Game format records
  const gameFormatStats: { [key: string]: { w: number, l: number, d: number } } = {
    singles: { w: 0, l: 0, d: 0 },
    scramble: { w: 0, l: 0, d: 0 },
    fourball: { w: 0, l: 0, d: 0 },
    foursomes: { w: 0, l: 0, d: 0 },
    tip_n_rip: { w: 0, l: 0, d: 0 }
  };

  matches.forEach(match => {
    // Determine if player was on USA (team1) or Europe (team2)
    const isOnUSA = match.team1_player1_id === player.id || match.team1_player2_id === player.id;
    const gameType = match.game_type.toLowerCase().replace(/-/g, '_').replace(/ /g, '_');

    if (match.result === 'W') {
      if (isOnUSA) {
        // USA won, player on USA = Win
        wins++;
        totalPoints += 1;
        if (gameFormatStats[gameType]) gameFormatStats[gameType].w++;
      } else {
        // USA won, player on Europe = Loss
        losses++;
        if (gameFormatStats[gameType]) gameFormatStats[gameType].l++;
      }
    } else if (match.result === 'L') {
      if (isOnUSA) {
        // USA lost, player on USA = Loss
        losses++;
        if (gameFormatStats[gameType]) gameFormatStats[gameType].l++;
      } else {
        // USA lost, player on Europe = Win
        wins++;
        totalPoints += 1;
        if (gameFormatStats[gameType]) gameFormatStats[gameType].w++;
      }
    } else if (match.result === 'D') {
      draws++;
      totalPoints += 0.5;
      if (gameFormatStats[gameType]) gameFormatStats[gameType].d++;
    }
  });

  const winPercentage = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;

  // Get current team from most recent year in team history
  const currentTeam = teamHistory.length > 0 ? teamHistory[0].team : 'Unknown';

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
              <p><strong>Team:</strong> {currentTeam}</p>
              
              {/* Team History - Show if player has been on different teams */}
              {teamHistory.length > 0 && new Set(teamHistory.map(t => t.team)).size > 1 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-sm mb-2">Team History:</p>
                  <div className="space-y-1 text-sm">
                    {teamHistory.map((th, idx) => (
                      <p key={idx}>
                        {th.year}: Team {th.team}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              
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
                  <p className="text-2xl font-bold text-blue-600">{totalPoints}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Win Percentage</p>
                  <p className="text-2xl font-bold text-blue-600">{winPercentage}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Overall Record</h3>
                  <div className="space-y-2">
                    <p><strong>Results (W-L-D):</strong> {wins}-{losses}-{draws}</p>
                    <p><strong>Matches Won:</strong> {wins}</p>
                    <p><strong>Matches Played:</strong> {matchesPlayed}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Game Format Records</h3>
                  <div className="space-y-2">
                    <p><strong>Singles:</strong> {gameFormatStats.singles.w}-{gameFormatStats.singles.l}-{gameFormatStats.singles.d}</p>
                    <p><strong>Scramble:</strong> {gameFormatStats.scramble.w}-{gameFormatStats.scramble.l}-{gameFormatStats.scramble.d}</p>
                    <p><strong>Four-Ball:</strong> {gameFormatStats.fourball.w}-{gameFormatStats.fourball.l}-{gameFormatStats.fourball.d}</p>
                    <p><strong>Foursomes:</strong> {gameFormatStats.foursomes.w}-{gameFormatStats.foursomes.l}-{gameFormatStats.foursomes.d}</p>
                    <p><strong>Tip N Rip:</strong> {gameFormatStats.tip_n_rip.w}-{gameFormatStats.tip_n_rip.l}-{gameFormatStats.tip_n_rip.d}</p>
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

        {/* Match History Section */}
        <MatchHistory matches={matches} playerId={player.id} tournamentHistory={tournamentHistory} />
      </div>
    </div>
  );
}
