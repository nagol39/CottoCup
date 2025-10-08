"use client";
import React, { useState } from "react";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

export default function AdminPage() {
  const [players, setPlayers] = useState([]);

  // Load players from the database if it exists
  React.useEffect(() => {
    const dbPath = path.join(process.cwd(), "data", "players.db");
    if (fs.existsSync(dbPath)) {
      try {
        const db = new Database(dbPath);
        const data = db.prepare("SELECT * FROM players").all();
        setPlayers(data);
        db.close();
      } catch (err) {
        console.error("Failed to load database:", err);
      }
    }
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-6">Here you can manage the player database.</p>

      <h2 className="text-xl font-semibold mb-2">Current Players</h2>
      {players.length === 0 ? (
        <p>No players found in the database.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Team</th>
              <th className="border p-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player: any) => (
              <tr key={player.id}>
                <td className="border p-2">{player.id}</td>
                <td className="border p-2">{player.name}</td>
                <td className="border p-2">{player.team}</td>
                <td className="border p-2">{player.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
