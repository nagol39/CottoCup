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
  total_points?: number;
  results_wld?: string;
  singles?: string;
  scramble?: string;
  four_ball?: string;
  foursomes?: string;
  tip_n_rip?: string;
  matches_won?: number;
  matches_played?: number;
  win_percentage?: number;
  handicap_18?: number;
  handicap_9?: number;
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
    total_points: '',
    results_wld: '',
    singles: '',
    scramble: '',
    four_ball: '',
    foursomes: '',
    tip_n_rip: '',
    matches_won: '',
    matches_played: '',
    win_percentage: '',
    handicap_18: '',
    handicap_9: '',
  });
  const [photoList, setPhotoList] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState<'name'|'team'|'handedness'|'handicap'>('name');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('asc');
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);
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
      total_points: formData.total_points === '' ? 0 : parseFloat(formData.total_points),
      results_wld: formData.results_wld || '0-0-0',
      singles: formData.singles || '0-0-0',
      scramble: formData.scramble || '0-0-0',
      four_ball: formData.four_ball || '0-0-0',
      foursomes: formData.foursomes || '0-0-0',
      tip_n_rip: formData.tip_n_rip || '0-0-0',
      matches_won: formData.matches_won === '' ? 0 : parseInt(formData.matches_won),
      matches_played: formData.matches_played === '' ? 0 : parseInt(formData.matches_played),
      win_percentage: formData.win_percentage === '' ? 0 : parseFloat(formData.win_percentage),
      handicap_18: formData.handicap_18 === '' ? 0 : parseFloat(formData.handicap_18),
      handicap_9: formData.handicap_9 === '' ? 0 : parseFloat(formData.handicap_9),
    };

    try {
      const res = await fetch('/api/admin', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save player');

      setFormData({ id: 0, name: '', team: 'USA', handedness: 'Right', handicap: '', photo: '', bio: '', total_points: '', results_wld: '', singles: '', scramble: '', four_ball: '', foursomes: '', tip_n_rip: '', matches_won: '', matches_played: '', win_percentage: '', handicap_18: '', handicap_9: '' });
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
      total_points: player.total_points?.toString() ?? '',
      results_wld: player.results_wld || '',
      singles: player.singles || '',
      scramble: player.scramble || '',
      four_ball: player.four_ball || '',
      foursomes: player.foursomes || '',
      tip_n_rip: player.tip_n_rip || '',
      matches_won: player.matches_won?.toString() ?? '',
      matches_played: player.matches_played?.toString() ?? '',
      win_percentage: player.win_percentage?.toString() ?? '',
      handicap_18: player.handicap_18?.toString() ?? '',
      handicap_9: player.handicap_9?.toString() ?? '',
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
        className="mb-8 border border-gray-300 rounded-xl p-8 bg-white shadow-lg max-w-5xl mx-auto"
      >
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Player' : 'Add New Player'}
        </h2>
        <div className="flex flex-row gap-12">
          {/* Left Column - Photo */}
          <div className="w-80 flex flex-col items-center">
            <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
              {formData.photo ? (
                <img
                  src={`/photos/players/${formData.photo}`}
                  alt="Player"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            <div className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-3">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm text-gray-600 mb-3">Drag and drop an image, or...</p>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  // File will be handled in handleSubmit
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition font-semibold mb-2"
              >
                Upload Photo
              </button>
              <button
                type="button"
                onClick={() => setShowPhotoLibrary(true)}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition text-sm"
              >
                Choose From Library
              </button>
            </div>

            <button
              type="submit"
              className={`w-full rounded-md py-3 font-semibold transition text-lg ${formData.handicap === '' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              disabled={formData.handicap === ''}
            >
              {isEditing ? 'Update Player' : 'Add Player'}
            </button>
            {isEditing && (
              <button
                type="button"
                className="w-full rounded-md py-2 font-semibold bg-red-600 text-white hover:bg-red-700 mt-2"
                onClick={() => {
                  setFormData({ id: 0, name: '', team: 'USA', handedness: 'Right', handicap: '', photo: '', bio: '', total_points: '', results_wld: '', singles: '', scramble: '', four_ball: '', foursomes: '', tip_n_rip: '', matches_won: '', matches_played: '', win_percentage: '', handicap_18: '', handicap_9: '' });
                  if (fileInputRef.current) fileInputRef.current.value = '';
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Middle Column - Basic Info */}
          <div className="flex-1">
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Player Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Player Name"
                className="border border-gray-300 rounded-md w-full p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Team</label>
              <select
                name="team"
                value={formData.team}
                onChange={handleChange}
                className="border border-gray-300 rounded-md w-full p-2"
              >
                <option value="USA">Team USA</option>
                <option value="Europe">Team Europe</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Handedness</label>
              <select
                name="handedness"
                value={formData.handedness}
                onChange={handleChange}
                className="border border-gray-300 rounded-md w-full p-2"
              >
                <option value="Right">Right</option>
                <option value="Left">Left</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Handicap</label>
              <input
                type="text"
                name="handicap"
                value={formData.handicap}
                onChange={handleChange}
                placeholder="Enter handicap here"
                inputMode="decimal"
                pattern="[0-9.]*"
                className="border border-gray-300 rounded-md w-full p-2"
                style={{ MozAppearance: 'textfield' }}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Player bio (e.g., 'Logan consistently finds the water')"
                className="border border-gray-300 rounded-md w-full p-2 h-24 resize-none"
              />
            </div>
          </div>

          {/* Right Column - Statistics */}
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-4">Statistics</h3>
            
            <div className="grid grid-cols-2 gap-x-4">
              {/* Left Column */}
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1">Total Points</label>
                  <input
                    type="text"
                    name="total_points"
                    value={formData.total_points}
                    onChange={handleChange}
                    placeholder="e.g., 12.5"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1">Results (W-L-D)</label>
                  <input
                    type="text"
                    name="results_wld"
                    value={formData.results_wld}
                    onChange={handleChange}
                    placeholder="e.g., 5-2-1"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1">Singles</label>
                  <input
                    type="text"
                    name="singles"
                    value={formData.singles}
                    onChange={handleChange}
                    placeholder="e.g., 2-3-0"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1">Scramble</label>
                  <input
                    type="text"
                    name="scramble"
                    value={formData.scramble}
                    onChange={handleChange}
                    placeholder="e.g., 1-0-1"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1">Four-Ball</label>
                  <input
                    type="text"
                    name="four_ball"
                    value={formData.four_ball}
                    onChange={handleChange}
                    placeholder="e.g., 2-0-0"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1">Foursomes</label>
                  <input
                    type="text"
                    name="foursomes"
                    value={formData.foursomes}
                    onChange={handleChange}
                    placeholder="e.g., 1-1-0"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </div>
              </div>
              
              {/* Right Column */}
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1">Tip N Rip</label>
                  <input
                    type="text"
                    name="tip_n_rip"
                    value={formData.tip_n_rip}
                    onChange={handleChange}
                    placeholder="e.g., 0-0-0"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1">Matches Won</label>
                  <input
                    type="text"
                    name="matches_won"
                    value={formData.matches_won}
                    onChange={handleChange}
                    placeholder="e.g., 1"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1">Matches Played</label>
                  <input
                    type="text"
                    name="matches_played"
                    value={formData.matches_played}
                    onChange={handleChange}
                    placeholder="e.g., 8"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1">Win Percentage</label>
                  <input
                    type="text"
                    name="win_percentage"
                    value={formData.win_percentage}
                    onChange={handleChange}
                    placeholder="e.g., 62.5"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1">18 Hole Handicap</label>
                  <input
                    type="text"
                    name="handicap_18"
                    value={formData.handicap_18}
                    onChange={handleChange}
                    placeholder="e.g., 15.3"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-semibold mb-1">9 Hole Handicap</label>
                  <input
                    type="text"
                    name="handicap_9"
                    value={formData.handicap_9}
                    onChange={handleChange}
                    placeholder="e.g., 7.7"
                    className="border border-gray-300 rounded-md w-full p-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Photo Library Modal */}
      {showPhotoLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowPhotoLibrary(false)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Choose Photo from Library</h3>
              <button
                onClick={() => setShowPhotoLibrary(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            <div className="grid grid-cols-6 gap-4">
              {photoList.map((filename) => (
                <button
                  type="button"
                  key={filename}
                  className={`border-2 rounded-lg p-2 flex flex-col items-center hover:border-blue-500 transition ${formData.photo === filename ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
                  onClick={() => {
                    setFormData({ ...formData, photo: filename });
                    setShowPhotoLibrary(false);
                  }}
                >
                  <img
                    src={`/photos/players/${filename}`}
                    alt={filename}
                    className="w-full h-24 object-cover rounded mb-1"
                  />
                  <span className="text-xs truncate w-full text-center">{filename}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
                    {isEditing && formData.id === player.id ? (
                      <>
                        <button
                          disabled
                          className="bg-green-500 text-white px-2 py-1 rounded mr-2 cursor-not-allowed flex items-center gap-1 inline-flex"
                        >
                          <span>✓</span> Editing
                        </button>
                        <button
                          onClick={() => {
                            setFormData({ id: 0, name: '', team: 'USA', handedness: 'Right', handicap: '', photo: '', bio: '', total_points: '', results_wld: '', singles: '', scramble: '', four_ball: '', foursomes: '', tip_n_rip: '', matches_won: '', matches_played: '', win_percentage: '', handicap_18: '', handicap_9: '' });
                            if (fileInputRef.current) fileInputRef.current.value = '';
                            setIsEditing(false);
                          }}
                          className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(player)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                          disabled={isEditing}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(player.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                          disabled={isEditing}
                        >
                          Delete
                        </button>
                      </>
                    )}
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
