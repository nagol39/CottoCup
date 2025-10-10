'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Player {
  id: number;
  name: string;
  team: string;
  handedness: string;
  handicap: number;
  photo?: string;
}

export default function AdminPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    name: '',
    team: 'USA',
    handedness: 'Right',
    handicap: '',
    photo: '',
  });
  const [photoList, setPhotoList] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Fetch players from the admin API on load
  useEffect(() => {
    fetchPlayers();
    fetchPhotoList();
  }, []);

  const fetchPhotoList = async () => {
    // List photos from public/photos folder
    setPhotoList([
      'eu1.jpg','eu2.jpg','eu3.jpg','eu4.jpg','eu5.jpg','eu6.jpg',
      'us1.jpg','us2.jpg','us3.jpg','us4.jpg','us5.jpg','us6.jpg'
    ]);
  };

  const fetchPlayers = async () => {
    try {
  const res = await fetch('/api/admin');
      if (!res.ok) throw new Error('Failed to fetch players');
      const data = await res.json();
      setPlayers(data);
    } catch (err) {
      console.error('Error fetching players:', err);
    }
  };

  // ✅ Update form data
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'handicap') {
      // Only allow numbers and decimals
      const val = value.replace(/[^\d.]/g, '');
      setFormData({ ...formData, handicap: val });
    } else if (name === 'photo') {
      setFormData({ ...formData, photo: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Add or update player
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';

    let photoFilename = formData.photo;
    // If a file is selected, upload it
    if (fileInputRef.current && fileInputRef.current.files && fileInputRef.current.files[0]) {
      const file = fileInputRef.current.files[0];
      // Upload to /api/upload (not implemented here, but you can add it)
      // For now, just use the filename
      photoFilename = file.name;
    }

    const payload = {
      ...formData,
      handicap: formData.handicap === '' ? 0 : parseFloat(formData.handicap),
      photo: photoFilename,
    };

    try {
      const res = await fetch('/api/admin', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save player');

      setFormData({ id: 0, name: '', team: 'USA', handedness: 'Right', handicap: '', photo: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsEditing(false);
      await fetchPlayers();
    } catch (err) {
      console.error('Error saving player:', err);
    }
  };

  // ✅ Edit existing player
  const handleEdit = (player: Player) => {
    setFormData({
      id: player.id,
      name: player.name,
      team: player.team,
      handedness: player.handedness,
      handicap: player.handicap?.toString() ?? '',
      photo:
        player.photo && player.photo !== ''
          ? player.photo
          : player.team === 'Europe'
            ? 'eu1.jpg'
            : 'us1.jpg',
    });
    setIsEditing(true);
  };

  // ✅ Delete player
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this player?')) return;

    try {
      const res = await fetch('/api/admin', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Failed to delete player');
      await fetchPlayers();
    } catch (err) {
      console.error('Error deleting player:', err);
    }
  };

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-4xl font-extrabold mb-6 text-center">Admin - Manage Players</h1>

      {/* Player Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 border border-gray-300 rounded-xl p-4 bg-gray-50 shadow-sm max-w-md mx-auto"
      >
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Edit Player' : 'Add New Player'}
        </h2>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Player Name"
          className="border border-gray-300 rounded w-full p-2 mb-3"
          required
        />

        <select
          name="team"
          value={formData.team}
          onChange={handleChange}
          className="border border-gray-300 rounded w-full p-2 mb-3"
        >
          <option value="USA">Team USA</option>
          <option value="Europe">Team Europe</option>
        </select>

        <select
          name="handedness"
          value={formData.handedness}
          onChange={handleChange}
          className="border border-gray-300 rounded w-full p-2 mb-3"
        >
          <option value="Right">Right</option>
          <option value="Left">Left</option>
        </select>

        {/* Photo selection dropdown */}
        <select
          name="photo"
          value={formData.photo}
          onChange={handleChange}
          className="border border-gray-300 rounded w-full p-2 mb-3"
        >
          <option value="">Select a photo...</option>
          {photoList.map((filename) => (
            <option key={filename} value={filename}>{filename}</option>
          ))}
        </select>

        {/* Photo upload */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="border border-gray-300 rounded w-full p-2 mb-3"
        />

        <input
          type="text"
          name="handicap"
          value={formData.handicap}
          onChange={handleChange}
          placeholder="Enter handicap here"
          inputMode="decimal"
          pattern="[0-9.]*"
          className="border border-gray-300 rounded w-full p-2 mb-3"
          style={{ MozAppearance: 'textfield' }}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded py-2 font-semibold hover:bg-blue-700 transition"
        >
          {isEditing ? 'Update Player' : 'Add Player'}
        </button>
      </form>

      {/* Players Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Team</th>
              <th className="border p-2">Handedness</th>
              <th className="border p-2">Handicap</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {players.length > 0 ? (
              players.map((player) => (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="border p-2">{player.name}</td>
                  <td className="border p-2">{player.team}</td>
                  <td className="border p-2">{player.handedness}</td>
                  <td className="border p-2">{player.handicap}</td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleEdit(player)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(player.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No players found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
