'use client';

import { useState } from 'react';

interface Match {
  id: number;
  year: number;
  match_number: number;
  game_type: string;
  team1_player1_id: number;
  team1_player2_id: number;
  team2_player1_id: number;
  team2_player2_id: number;
  team1_player1_name: string;
  team1_player2_name: string;
  team2_player1_name: string;
  team2_player2_name: string;
  result: string;
}

interface MatchHistoryProps {
  matches: Match[];
  playerId: number;
}

export default function MatchHistory({ matches, playerId }: MatchHistoryProps) {
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Get unique years from matches
  const years = Array.from(new Set(matches.map(m => m.year))).sort((a, b) => b - a);
  
  // Filter matches by selected year
  const filteredMatches = selectedYear === 'all' 
    ? matches 
    : matches.filter(m => m.year === parseInt(selectedYear));

  // Helper function to format match result for display
  const getMatchResultDisplay = (match: Match) => {
    const isOnUSA = match.team1_player1_id === playerId || match.team1_player2_id === playerId;
    
    let resultText = '';
    let resultClass = '';
    
    if (match.result === 'W') {
      if (isOnUSA) {
        resultText = 'W';
        resultClass = 'bg-green-100 text-green-800';
      } else {
        resultText = 'L';
        resultClass = 'bg-red-100 text-red-800';
      }
    } else if (match.result === 'L') {
      if (isOnUSA) {
        resultText = 'L';
        resultClass = 'bg-red-100 text-red-800';
      } else {
        resultText = 'W';
        resultClass = 'bg-green-100 text-green-800';
      }
    } else {
      resultText = 'D';
      resultClass = 'bg-gray-100 text-gray-800';
    }
    
    return { resultText, resultClass };
  };

  // Helper function to get partner name
  const getPartnerName = (match: Match) => {
    if (match.team1_player1_id === playerId && match.team1_player2_name) {
      return match.team1_player2_name;
    } else if (match.team1_player2_id === playerId && match.team1_player1_name) {
      return match.team1_player1_name;
    } else if (match.team2_player1_id === playerId && match.team2_player2_name) {
      return match.team2_player2_name;
    } else if (match.team2_player2_id === playerId && match.team2_player1_name) {
      return match.team2_player1_name;
    }
    return null;
  };

  // Helper function to get opponent names
  const getOpponentNames = (match: Match) => {
    const isOnUSA = match.team1_player1_id === playerId || match.team1_player2_id === playerId;
    
    if (isOnUSA) {
      // Player is on USA (team1), opponents are on Europe (team2)
      const opponents = [match.team2_player1_name, match.team2_player2_name].filter(Boolean);
      return opponents.join(' & ') || 'TBD';
    } else {
      // Player is on Europe (team2), opponents are on USA (team1)
      const opponents = [match.team1_player1_name, match.team1_player2_name].filter(Boolean);
      return opponents.join(' & ') || 'TBD';
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6 border-b-2 border-blue-600 pb-2">Match History</h2>
      
      {/* Year Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedYear('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
            selectedYear === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Years
        </button>
        {years.map(year => (
          <button
            key={year}
            onClick={() => setSelectedYear(year.toString())}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedYear === year.toString()
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {year}
          </button>
        ))}
      </div>

      {/* Matches List */}
      {filteredMatches.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No matches found for this selection.</p>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map(match => {
            const { resultText, resultClass } = getMatchResultDisplay(match);
            const partnerName = getPartnerName(match);
            const opponentNames = getOpponentNames(match);
            
            return (
              <div key={match.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full font-bold text-sm ${resultClass}`}>
                        {resultText}
                      </span>
                      <span className="text-sm text-gray-600">
                        {match.year} - Match {match.match_number}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">
                        {match.game_type}
                      </p>
                      
                      {partnerName && (
                        <p className="text-gray-700">
                          <span className="text-sm text-gray-500">Partner:</span> {partnerName}
                        </p>
                      )}
                      
                      <p className="text-gray-700">
                        <span className="text-sm text-gray-500">vs.</span> {opponentNames}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
