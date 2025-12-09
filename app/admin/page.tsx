'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Player {
  id: number;
  name: string;
  team: string;
  handedness: string;
  handicap: number;
  photo?: string;
  bio?: string;
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
    bio: '',
  });
  const [photoList, setPhotoList] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState<'name'|'team'|'handedness'|'handicap'>('name');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('asc');
  // Sort players array based on sortBy and sortOrder
  const sortedPlayers = [...players].sort((a, b) => {
    if (sortBy === 'team') {
      // Custom sort: USA first (asc), Europe first (desc), both alphabetical by name
      if (a.team === b.team) {
        return a.name.localeCompare(b.name);
      }
      if (sortOrder === 'asc') {
        return a.team === 'USA' ? -1 : 1;
      } else {
        return a.team === 'Europe' ? -1 : 1;
      }
    } else if (sortBy === 'handedness') {
      // Custom sort: Right first (asc), Left first (desc), both alphabetical by name
      if (a.handedness === b.handedness) {
        return a.name.localeCompare(b.name);
      }
      if (sortOrder === 'asc') {
        return a.handedness === 'Right' ? -1 : 1;
      } else {
        return a.handedness === 'Left' ? -1 : 1;
      }
    } else if (sortBy === 'handicap') {
      let valA = parseFloat(a.handicap as any) || 0;
      let valB = parseFloat(b.handicap as any) || 0;
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    } else {
      let valA = (a[sortBy] || '').toString().toLowerCase();
      let valB = (b[sortBy] || '').toString().toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    }
  });

  const handleSort = (category: 'name'|'team'|'handedness'|'handicap') => {
    if (sortBy === category) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(category);
      setSortOrder('asc');
    }
  };

  // ✅ Fetch players from the admin API on load
  useEffect(() => {
    fetchPlayers();
    fetchPhotoList();
  }, []);

  const fetchPhotoList = async () => {
    try {
      const res = await fetch('/api/photos/players');
      if (!res.ok) throw new Error('Failed to fetch photo list');
      const data = await res.json();
      setPhotoList(data);
    } catch (err) {
      setPhotoList([]);
    }
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        photoFilename = uploadData.filename;
      } else {
        alert('Photo upload failed');
        return;
      }
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

      setFormData({ id: 0, name: '', team: 'USA', handedness: 'Right', handicap: '', photo: '', bio: '' });
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
      bio: player.bio || '',
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        className="mb-8 border border-gray-300 rounded-xl p-4 bg-gray-50 shadow-sm max-w-3xl mx-auto"
      >
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? 'Edit Player' : 'Add New Player'}
        </h2>
        <div className="flex flex-row gap-8">
          <div className="flex-1 items-start">
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
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Player bio (e.g., 'Logan consistently finds the water')"
              className="border border-gray-300 rounded w-full p-2 mb-3 h-24 resize-none"
            />
            <button
              type="submit"
              className={`w-full rounded py-2 font-semibold transition ${formData.handicap === '' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              disabled={formData.handicap === ''}
            >
              {isEditing ? 'Update Player' : 'Add Player'}
            </button>
            {isEditing && (
              <button
                type="button"
                className="w-full rounded py-2 font-semibold bg-red-600 text-white hover:bg-red-700 mt-2"
                onClick={() => {
                  setFormData({ id: 0, name: '', team: 'USA', handedness: 'Right', handicap: '', photo: '', bio: '' });
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            )}
          </div>
          <div className="w-80">
            {/* Photo selection/upload choice */}
            <div className="mb-0 pt-1">
              <label className="block font-semibold mb-2">Photo:</label>
              <div className="flex gap-4 mb-2">
                <button
                  type="button"
                  className={`px-3 py-1 rounded border ${formData.photo === '' ? 'bg-blue-100 border-blue-600 font-bold' : 'bg-gray-100 border-gray-300'}`}
                  onClick={() => setFormData({ ...formData, photo: '' })}
                >
                  Upload a photo
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded border ${formData.photo !== '' ? 'bg-blue-100 border-blue-600 font-bold' : 'bg-gray-100 border-gray-300'}`}
                  onClick={() => setFormData({ ...formData, photo: photoList[0] || '' })}
                >
                  Select a photo from list
                </button>
              </div>
              {/* Upload input only if photo is blank */}
              {formData.photo === '' && (
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="border border-gray-300 rounded w-full p-2 mb-3"
                />
              )}
              {/* Photo grid only if selecting from list */}
              {formData.photo !== '' && (
                <div
                  className="grid grid-cols-4 gap-3 max-h-56 overflow-y-auto p-1 border rounded bg-gray-50"
                  style={{ minHeight: '120px' }}
                >
                  {photoList.map((filename) => (
                    <button
                      type="button"
                      key={filename}
                      className={`border rounded p-1 flex flex-col items-center hover:border-blue-500 focus:border-blue-600 ${formData.photo === filename ? 'border-2 border-blue-600' : ''}`}
                      onClick={() => setFormData({ ...formData, photo: filename })}
                    >
                      <img
                        src={`/photos/players/${filename}`}
                        alt={filename}
                        className="h-16 w-16 object-cover rounded mb-1"
                      />
                      <span className="text-xs truncate w-16">{filename}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Players Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-left">
          <thead className="bg-gray-200">
            <tr>
              <th
                className={`border p-2 cursor-pointer ${sortBy === 'name' ? 'bg-blue-100 font-bold' : ''}`}
                onClick={() => handleSort('name')}
              >
                Name {sortBy === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                className={`border p-2 cursor-pointer ${sortBy === 'team' ? 'bg-blue-100 font-bold' : ''}`}
                onClick={() => handleSort('team')}
              >
                Team {sortBy === 'team' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                className={`border p-2 cursor-pointer ${sortBy === 'handedness' ? 'bg-blue-100 font-bold' : ''}`}
                onClick={() => handleSort('handedness')}
              >
                Handedness {sortBy === 'handedness' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th
                className={`border p-2 cursor-pointer ${sortBy === 'handicap' ? 'bg-blue-100 font-bold' : ''}`}
                onClick={() => handleSort('handicap')}
              >
                Handicap {sortBy === 'handicap' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.length > 0 ? (
              sortedPlayers.map((player) => (
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
                <td colSpan={4} className="text-center py-4 text-gray-500">
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
