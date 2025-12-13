'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

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

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const yearParam = searchParams.get('year');
  const [matches, setMatches] = useState<Match[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [year, setYear] = useState<number>(yearParam ? parseInt(yearParam) : 2025);

  useEffect(() => {
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [year]);

  const fetchAvailableYears = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        const years = data.map((item: any) => item.year).sort((a: number, b: number) => b - a);
        setAvailableYears(years);
      }
    } catch (err) {
      console.error('Error fetching years:', err);
      // Fallback to default years
      setAvailableYears([2025, 2024, 2023, 2022, 2021, 2020]);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch(`/api/matches?year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
    }
  };

  // Group matches by game_type
  const groupedByGameType: { [key: string]: Match[] } = {};
  matches.forEach(match => {
    if (!groupedByGameType[match.game_type]) {
      groupedByGameType[match.game_type] = [];
    }
    groupedByGameType[match.game_type].push(match);
  });

  // Calculate scores
  const calculateScores = (matchArray: Match[]) => {
    let usaScore = 0;
    let euScore = 0;

    matchArray.forEach(match => {
      if (match.result === 'W') {
        usaScore += 1;
      } else if (match.result === 'L') {
        euScore += 1;
      } else if (match.result === 'D') {
        usaScore += 0.5;
        euScore += 0.5;
      }
    });

    return { usaScore, euScore };
  };

  // Calculate total scores
  const totalScores = calculateScores(matches);

  const renderResultBox = (result: string, side: 'europe' | 'usa') => {
    if (!result) return <div className="w-16 h-16" />;

    const isEurope = side === 'europe';
    let bgColor = '';
    let borderColor = '';
    let textColor = '';

    if (result === 'W') {
      bgColor = isEurope ? 'bg-blue-800' : 'bg-red-700';
      borderColor = isEurope ? 'border-blue-900' : 'border-red-900';
      textColor = 'text-white';
    } else if (result === 'L') {
      bgColor = isEurope ? 'bg-blue-100' : 'bg-red-100';
      borderColor = isEurope ? 'border-blue-800' : 'border-red-700';
      textColor = isEurope ? 'text-blue-800' : 'text-red-700';
    } else if (result === 'D') {
      bgColor = 'bg-gray-200';
      borderColor = 'border-gray-400';
      textColor = 'text-gray-700';
    }

    return (
      <div className={`w-16 h-16 flex items-center justify-center border-2 ${bgColor} ${borderColor} ${textColor} font-bold text-xl`}>
        {result}
      </div>
    );
  };

  const renderMatchRow = (match: Match) => {
    // For Europe side (left), flip the result
    const europeResult = match.result === 'W' ? 'L' : match.result === 'L' ? 'W' : 'D';
    // For USA side (right), use the result as is
    const usaResult = match.result;

    return (
      <div key={match.id} className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-3">
        {/* Europe Side */}
        <div className="flex items-center justify-end gap-2">
          <div className="text-right">
            <div className="font-semibold text-blue-900 text-sm">{match.team2_player1_name}</div>
            <div className="font-semibold text-blue-900 text-sm">{match.team2_player2_name}</div>
          </div>
          <div className="border-2 border-blue-800 bg-blue-50 p-2 w-32">
            <div className="font-semibold text-blue-900 text-xs">{match.team2_player1_name}</div>
            <div className="font-semibold text-blue-900 text-xs">{match.team2_player2_name}</div>
          </div>
          {renderResultBox(europeResult, 'europe')}
        </div>

        {/* VS */}
        <div className="text-gray-400 font-bold text-sm">VS</div>

        {/* USA Side */}
        <div className="flex items-center gap-2">
          {renderResultBox(usaResult, 'usa')}
          <div className="border-2 border-red-700 bg-red-50 p-2 w-32">
            <div className="font-semibold text-red-900 text-xs">{match.team1_player1_name}</div>
            <div className="font-semibold text-red-900 text-xs">{match.team1_player2_name}</div>
          </div>
          <div className="text-left">
            <div className="font-semibold text-red-900 text-sm">{match.team1_player1_name}</div>
            <div className="font-semibold text-red-900 text-sm">{match.team1_player2_name}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Match Results - {year}</h1>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-4 py-2 border-2 border-gray-300 rounded text-lg"
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {matches.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-xl">No match results available for {year}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-blue-100 to-red-100 border-4 border-gray-800 rounded-lg p-8 mb-8">
              <div className="grid grid-cols-3 gap-8 items-center">
                <div className="text-center">
                  <p className="text-5xl font-bold text-blue-800">{totalScores.euScore}</p>
                  <p className="text-2xl text-blue-900 font-semibold mt-2">🇪🇺 Europe</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 font-semibold">Total Score</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-bold text-red-700">{totalScores.usaScore}</p>
                  <p className="text-2xl text-red-900 font-semibold mt-2">🇺🇸 USA</p>
                </div>
              </div>
            </div>

            {/* Team Headers */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center pb-4 border-b-2">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-blue-800">🇪🇺 Europe</h2>
              </div>
              <div className="w-12"></div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-red-700">🇺🇸 USA</h2>
              </div>
            </div>

            {/* Games Grouped by Type */}
            {Object.keys(groupedByGameType).sort().map(gameType => {
              const gameMatches = groupedByGameType[gameType];
              const gameScores = calculateScores(gameMatches);
              return (
                <div key={gameType} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
                    <h3 className="text-2xl font-bold uppercase">{gameType}</h3>
                    <div className="flex gap-8 text-lg font-semibold">
                      <span className="text-blue-300">EU {gameScores.euScore}</span>
                      <span className="text-red-300">USA {gameScores.usaScore}</span>
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    {gameMatches.map(match => renderMatchRow(match))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
