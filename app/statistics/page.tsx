'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StatisticsPage() {
  const [teamUSA, setTeamUSA] = useState([]);
  const [teamEurope, setTeamEurope] = useState([]);
  const [sortBy, setSortBy] = useState<'name' | 'handicap' | 'left' | 'right'>('name');

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(data => {
        setTeamUSA(data.teamUSA);
        setTeamEurope(data.teamEurope);
      });
  }, []);

  const sortPlayers = (players: any[], sort: string) => {
    return [...players].sort((a, b) => {
      if (sort === 'handicap') return a.handicap - b.handicap;
      if (sort === 'left') {
        if (a.handedness === b.handedness) return a.name.localeCompare(b.name);
        return a.handedness === 'Left' ? -1 : 1;
      }
      if (sort === 'right') {
        if (a.handedness === b.handedness) return a.name.localeCompare(b.name);
        return a.handedness === 'Right' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  };

  const teamUSASorted = sortPlayers(teamUSA, sortBy);
  const teamEuropeSorted = sortPlayers(teamEurope, sortBy);

  return (
    <div className="p-8 bg-white text-black min-h-screen">
      <h1 className="text-4xl font-extrabold mb-6 text-center">Ryder Cup Statistics</h1>

      {/* Overall wins */}
      <div className="flex justify-around mb-10">
        <div className="text-center border-4 border-red-600 rounded-xl p-4 w-40 bg-red-50">
          <h2 className="text-2xl font-bold text-red-600">Team USA</h2>
          <p className="text-xl font-semibold text-black">6 Wins</p>
        </div>
        <div className="text-center border-4 border-blue-600 rounded-xl p-4 w-40 bg-blue-50">
          <h2 className="text-2xl font-bold text-blue-600">Team Europe</h2>
          <p className="text-xl font-semibold text-black">0 Wins</p>
        </div>
      </div>

      {/* Sorting dropdown */}
      <div className="flex justify-center mb-6">
        <label className="mr-2 font-semibold">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="name">Name</option>
          <option value="handicap">Handicap</option>
          <option value="left">Left Handed</option>
          <option value="right">Right Handed</option>
        </select>
      </div>

      {/* Player lists */}
      <div className="grid grid-cols-2 gap-8">
        {/* Team USA */}
        <div>
          <h3 className="text-xl font-semibold text-red-600 mb-3">Team USA Players</h3>
          <div className="space-y-4">
            {teamUSASorted.map((player: any) => (
              <Link
                key={player.id}
                href={`/players/${player.slug}`}
                className="flex items-center p-4 bg-red-100 border border-red-400 rounded-xl text-black hover:bg-red-200 transition"
              >
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-24 h-24 rounded-full border-2 border-red-600 mr-4"
                />
                <div>
                  <p className="font-bold">{player.name}</p>
                  <p>Handicap: {player.handicap}</p>
                  <p>Handedness: {player.handedness}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Team Europe */}
        <div>
          <h3 className="text-xl font-semibold text-blue-600 mb-3">Team Europe Players</h3>
          <div className="space-y-4">
            {teamEuropeSorted.map((player: any) => (
              <Link
                key={player.id}
                href={`/players/${player.slug}`}
                className="flex items-center p-4 bg-blue-100 border border-blue-400 rounded-xl text-black hover:bg-blue-200 transition"
              >
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-24 h-24 rounded-full border-2 border-blue-600 mr-4"
                />
                <div>
                  <p className="font-bold">{player.name}</p>
                  <p>Handicap: {player.handicap}</p>
                  <p>Handedness: {player.handedness}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
