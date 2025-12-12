'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Player {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  team: string;
  handedness: string;
  handicap: number;
  photo?: string;
  bio?: string;
  handicap_18?: number;
  handicap_9?: number;
}

interface TeamHistory {
  id: number;
  player_id: number;
  year: number;
  team: string;
  player_name: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'players' | 'team-history'>('players');
  const [players, setPlayers] = useState<Player[]>([]);
  const [formData, setFormData] = useState({
    id: 0,
    first_name: '',
    last_name: '',
    name: '',
    handedness: 'Right',
    handicap: '',
    photo: '',
    bio: '',
    handicap_18: '',
    handicap_9: '',
  });
  const [photoList, setPhotoList] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState<'name'|'team'|'handedness'|'handicap'>('name');
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('asc');
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);

  // Team History state
  const [teamHistory, setTeamHistory] = useState<TeamHistory[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [teamHistoryForm, setTeamHistoryForm] = useState({
    player_id: 0,
    year: new Date().getFullYear(),
    team: 'USA',
  });
  const [editingTeamHistoryId, setEditingTeamHistoryId] = useState<number | null>(null);

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
    fetchTeamHistory();
  }, []);

  useEffect(() => {
    if (activeTab === 'team-history') {
      fetchTeamHistory();
    }
  }, [selectedPlayer, activeTab]);

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

      setFormData({ id: 0, first_name: '', last_name: '', name: '', handedness: 'Right', handicap: '', photo: '', bio: '', handicap_18: '', handicap_9: '' });
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
      first_name: player.first_name || '',
      last_name: player.last_name || '',
      name: player.name,
      handedness: player.handedness,
      handicap: player.handicap?.toString() ?? '',
      photo: player.photo || 'us1.jpg',
      bio: player.bio || '',
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

  // Team History functions
  const fetchTeamHistory = async () => {
    const url = selectedPlayer 
      ? `/api/team-history?player_id=${selectedPlayer}`
      : '/api/team-history';
    const res = await fetch(url);
    const data = await res.json();
    setTeamHistory(data);
  };

  const handleTeamHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const method = editingTeamHistoryId ? 'PUT' : 'POST';
    const payload = editingTeamHistoryId 
      ? { ...teamHistoryForm, id: editingTeamHistoryId }
      : teamHistoryForm;

    await fetch('/api/team-history', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setTeamHistoryForm({ player_id: 0, year: new Date().getFullYear(), team: 'USA' });
    setEditingTeamHistoryId(null);
    fetchTeamHistory();
  };

  const handleTeamHistoryEdit = (th: TeamHistory) => {
    setTeamHistoryForm({
      player_id: th.player_id,
      year: th.year,
      team: th.team,
    });
    setEditingTeamHistoryId(th.id);
  };

  const handleTeamHistoryDelete = async (id: number) => {
    if (!confirm('Delete this team assignment?')) return;
    
    await fetch('/api/team-history', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    
    fetchTeamHistory();
  };

  const filteredHistory = teamHistory.filter(th => 
    !selectedPlayer || th.player_id === selectedPlayer
  );

  const groupedHistory = filteredHistory.reduce((acc, th) => {
    if (!acc[th.player_name]) {
      acc[th.player_name] = [];
    }
    acc[th.player_name].push(th);
    return acc;
  }, {} as Record<string, TeamHistory[]>);

  return (
    <div className="p-8 bg-white min-h-screen text-black">
      <h1 className="text-4xl font-extrabold mb-6 text-center">Admin - Manage Players</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-300">
        <button
          onClick={() => setActiveTab('players')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'players'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Players
        </button>
        <button
          onClick={() => setActiveTab('team-history')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'team-history'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Team History
        </button>
      </div>

      {activeTab === 'players' && (
        <>
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
                  setFormData({ id: 0, first_name: '', last_name: '', name: '', handedness: 'Right', handicap: '', photo: '', bio: '', handicap_18: '', handicap_9: '' });
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
              <label className="block text-sm font-semibold mb-2">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First Name"
                className="border border-gray-300 rounded-md w-full p-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last Name"
                className="border border-gray-300 rounded-md w-full p-2"
                required
              />
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

          {/* Right Column - Additional Handicaps */}
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-4">Additional Handicaps</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">18 Hole Handicap</label>
              <input
                type="text"
                name="handicap_18"
                value={formData.handicap_18}
                onChange={handleChange}
                placeholder="e.g., 15.3"
                className="border border-gray-300 rounded-md w-full p-2"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">9 Hole Handicap</label>
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
      </form>

      {/* Photo Library Modal */}
      {showPhotoLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Choose Photo</h3>
              <button
                type="button"
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
                            setFormData({ id: 0, name: '', team: 'USA', handedness: 'Right', handicap: '', photo: '', bio: '', handicap_18: '', handicap_9: '' });
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
        </>
      )}

      {activeTab === 'team-history' && (
        <>
          <p className="mb-6 text-gray-600">
            Manage which team each player was on for specific years. This is used for players who have switched teams.
          </p>

          {/* Team History Form */}
          <form onSubmit={handleTeamHistorySubmit} className="mb-8 p-6 border border-gray-300 rounded-lg bg-gray-50">
            <h2 className="text-2xl font-bold mb-4">
              {editingTeamHistoryId ? 'Edit Team Assignment' : 'Add Team Assignment'}
            </h2>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block font-semibold mb-2">Player</label>
                <select
                  value={teamHistoryForm.player_id}
                  onChange={(e) => {
                    const playerId = Number(e.target.value);
                    setTeamHistoryForm({ ...teamHistoryForm, player_id: playerId });
                    // Automatically show this player's history
                    if (playerId > 0) {
                      setSelectedPlayer(playerId);
                    } else {
                      setSelectedPlayer(null);
                    }
                  }}
                  className="border p-2 rounded w-full"
                  required
                >
                  <option value={0}>Select player...</option>
                  {players.sort((a, b) => {
                    const aName = a.first_name || a.name;
                    const bName = b.first_name || b.name;
                    return aName.localeCompare(bName);
                  }).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-2">Year</label>
                <input
                  type="number"
                  value={teamHistoryForm.year}
                  onChange={(e) => setTeamHistoryForm({ ...teamHistoryForm, year: Number(e.target.value) })}
                  className="border p-2 rounded w-full"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Team</label>
                <select
                  value={teamHistoryForm.team}
                  onChange={(e) => setTeamHistoryForm({ ...teamHistoryForm, team: e.target.value })}
                  className="border p-2 rounded w-full"
                >
                  <option value="USA">Team USA</option>
                  <option value="Europe">Team Europe</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                {editingTeamHistoryId ? 'Update' : 'Add'}
              </button>
              
              {editingTeamHistoryId && (
                <button
                  type="button"
                  onClick={() => {
                    setTeamHistoryForm({ player_id: 0, year: new Date().getFullYear(), team: 'USA' });
                    setEditingTeamHistoryId(null);
                  }}
                  className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Selected Player's Team History - shown automatically when player selected */}
          {teamHistoryForm.player_id > 0 && (
            <div className="mb-6 p-4 border border-blue-300 rounded-lg bg-blue-50">
              <h3 className="text-lg font-bold mb-3">
                {players.find(p => p.id === teamHistoryForm.player_id)?.name}'s Team History
              </h3>
              {filteredHistory.filter(th => th.player_id === teamHistoryForm.player_id).length > 0 ? (
                <div className="space-y-2">
                  {filteredHistory
                    .filter(th => th.player_id === teamHistoryForm.player_id)
                    .sort((a, b) => b.year - a.year)
                    .map(th => (
                      <div key={th.id} className="flex items-center justify-between bg-white p-3 rounded">
                        <div>
                          <span className="font-semibold">{th.year}:</span>
                          <span className={`ml-2 px-3 py-1 rounded text-sm ${
                            th.team === 'USA' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            Team {th.team}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTeamHistoryEdit(th)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleTeamHistoryDelete(th.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-600 italic">No team history yet. Add their first team assignment above.</p>
              )}
            </div>
          )}

          {/* Filter */}
          <div className="mb-6">
            <label className="block font-semibold mb-2">Filter All Players:</label>
            <select
              value={selectedPlayer || ''}
              onChange={(e) => setSelectedPlayer(e.target.value ? Number(e.target.value) : null)}
              className="border p-2 rounded w-64"
            >
              <option value="">All Players</option>
              {players.sort((a, b) => {
                const aName = a.first_name || a.name;
                const bName = b.first_name || b.name;
                return aName.localeCompare(bName);
              }).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Team History List */}
          <div className="space-y-6">
            {Object.entries(groupedHistory).map(([playerName, histories]) => (
              <div key={playerName} className="border border-gray-300 rounded-lg p-4">
                <h3 className="text-xl font-bold mb-3">{playerName}</h3>
                
                <div className="space-y-2">
                  {histories
                    .sort((a, b) => b.year - a.year)
                    .map(th => (
                      <div key={th.id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                        <div>
                          <span className="font-semibold">{th.year}:</span>
                          <span className={`ml-2 px-3 py-1 rounded text-sm ${
                            th.team === 'USA' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            Team {th.team}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleTeamHistoryEdit(th)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleTeamHistoryDelete(th.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
            
            {Object.keys(groupedHistory).length === 0 && (
              <p className="text-gray-500 text-center py-8">No team history records found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
