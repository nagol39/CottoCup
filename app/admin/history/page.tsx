'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Player = {
  id: number
  name: string
  team: string
}

type HistoryItem = {
  id?: number
  year: number
  us_score?: string
  eu_score?: string
  location?: string
  notes?: string
}

type Match = {
  id?: number
  year: number
  match_number: number
  game_type: string
  team1_player1_id: number
  team1_player2_id: number
  team2_player1_id: number
  team2_player2_id: number
  result: string
  team1_player1_name?: string
  team1_player2_name?: string
  team2_player1_name?: string
  team2_player2_name?: string
}

type MatchForm = {
  year: number
  game_type: string
  team1_player1_id: number | null
  team1_player2_id: number | null
  team2_player1_id: number | null
  team2_player2_id: number | null
  result: string
}

export default function AdminHistory() {
  const [players, setPlayers] = useState<Player[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [form, setForm] = useState<HistoryItem>({ year: new Date().getFullYear() })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [location, setLocation] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [historyId, setHistoryId] = useState<number | null>(null)
  const [matchForm, setMatchForm] = useState<MatchForm>({
    year: new Date().getFullYear(),
    game_type: 'scramble',
    team1_player1_id: null,
    team1_player2_id: null,
    team2_player1_id: null,
    team2_player2_id: null,
    result: 'W'
  })
  const [editingMatchId, setEditingMatchId] = useState<number | null>(null)

  useEffect(() => {
    fetchPlayers()
    fetchHistory()
    fetchAllMatches()
    fetchMatches()
  }, [])

  useEffect(() => {
    fetchMatches()
    loadHistoryForYear()
  }, [selectedYear])

  function loadHistoryForYear() {
    const yearHistory = history.find(h => h.year === selectedYear)
    if (yearHistory) {
      setLocation(yearHistory.location || '')
      setNotes(yearHistory.notes || '')
      setHistoryId(yearHistory.id || null)
    } else {
      setLocation('')
      setNotes('')
      setHistoryId(null)
    }
  }

  async function fetchPlayers() {
    try {
      const res = await fetch('/api/admin')
      const data = await res.json()
      setPlayers(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchHistory() {
    try {
      const res = await fetch('/api/history')
      const data = await res.json()
      setHistory(data)
      // Load history for current year after fetching
      const yearHistory = data.find((h: HistoryItem) => h.year === selectedYear)
      if (yearHistory) {
        setLocation(yearHistory.location || '')
        setNotes(yearHistory.notes || '')
        setHistoryId(yearHistory.id || null)
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchMatches() {
    try {
      const res = await fetch(`/api/matches?year=${selectedYear}`)
      const data = await res.json()
      setMatches(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchAllMatches() {
    try {
      const res = await fetch('/api/matches')
      const data = await res.json()
      setAllMatches(data)
    } catch (err) {
      console.error(err)
    }
  }

  function calculateScores() {
    let usScore = 0
    let euScore = 0
    
    matches.forEach(match => {
      if (match.result === 'W') {
        usScore += 1
      } else if (match.result === 'L') {
        euScore += 1
      } else if (match.result === 'D') {
        usScore += 0.5
        euScore += 0.5
      }
    })
    
    return { usScore, euScore }
  }

  async function saveHistoryData() {
    try {
      const scores = calculateScores()
      const payload = {
        year: selectedYear,
        location,
        us_score: scores.usScore.toString(),
        eu_score: scores.euScore.toString(),
        notes
      }
      const url = '/api/history'
      const method = historyId ? 'PUT' : 'POST'
      if (historyId) (payload as any).id = historyId
      
      const res = await fetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      })
      
      if (!res.ok) throw new Error('Save failed')
      await fetchHistory()
    } catch (err) {
      console.error(err)
      alert('Failed to save tournament info')
    }
  }

  // Match management functions
  function handleMatchFormChange(field: keyof MatchForm, value: any) {
    setMatchForm({ ...matchForm, [field]: value })
  }

  async function handleMatchSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validate Player 1 for both teams is always required
    if (!matchForm.team1_player1_id || !matchForm.team2_player1_id) {
      alert('Please select Player 1 for both teams')
      return
    }
    
    // For non-singles matches, Player 2 is also required
    if (matchForm.game_type !== 'singles' && 
        (!matchForm.team1_player2_id || !matchForm.team2_player2_id)) {
      alert('Please select Player 2 for both teams')
      return
    }

    try {
      if (editingMatchId) {
        // Update existing match
        await fetch('/api/matches', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingMatchId,
            year: selectedYear,
            match_number: 1,
            game_type: matchForm.game_type,
            team1_player1_id: matchForm.team1_player1_id,
            team1_player2_id: matchForm.team1_player2_id,
            team2_player1_id: matchForm.team2_player1_id,
            team2_player2_id: matchForm.team2_player2_id,
            result: matchForm.result
          })
        })
      } else {
        // Create new match
        await fetch('/api/matches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            year: selectedYear,
            match_number: 1,
            game_type: matchForm.game_type,
            team1_player1_id: matchForm.team1_player1_id,
            team1_player2_id: matchForm.team1_player2_id,
            team2_player1_id: matchForm.team2_player1_id,
            team2_player2_id: matchForm.team2_player2_id,
            result: matchForm.result
          })
        })
      }

      // Reset form
      setMatchForm({
        year: selectedYear,
        game_type: 'scramble',
        team1_player1_id: null,
        team1_player2_id: null,
        team2_player1_id: null,
        team2_player2_id: null,
        result: 'W'
      })
      setEditingMatchId(null)
      await fetchMatches()
      await fetchAllMatches()
      await saveHistoryData() // Update scores
      alert('Match saved successfully!')
    } catch (err) {
      console.error(err)
      alert('Failed to save match')
    }
  }

  function startEditMatch(matchId: number) {
    const match = matches.find(m => m.id === matchId)
    if (match) {
      setMatchForm({
        year: selectedYear,
        game_type: match.game_type,
        team1_player1_id: match.team1_player1_id,
        team1_player2_id: match.team1_player2_id,
        team2_player1_id: match.team2_player1_id,
        team2_player2_id: match.team2_player2_id,
        result: match.result
      })
      setEditingMatchId(matchId)
      window.scrollTo({ top: document.getElementById('match-section')?.offsetTop, behavior: 'smooth' })
    }
  }

  async function handleDeleteMatch(matchId: number) {
    if (!confirm('Delete this match?')) return
    try {
      await fetch('/api/matches', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: matchId })
      })
      await fetchMatches()
      await fetchAllMatches()
      await saveHistoryData() // Update scores
    } catch (err) {
      console.error(err)
      alert('Failed to delete match')
    }
  }

  // Group matches by game_type
  const groupedMatches: { [key: string]: Match[] } = {}
  matches.forEach(m => {
    if (!groupedMatches[m.game_type]) {
      groupedMatches[m.game_type] = []
    }
    groupedMatches[m.game_type].push(m)
  })

  const usaPlayers = players
    .filter(p => p.team === 'USA')
    .sort((a, b) => {
      const aName = (a as any).first_name || a.name;
      const bName = (b as any).first_name || b.name;
      return aName.localeCompare(bName);
    });
  
  const europePlayers = players
    .filter(p => p.team === 'Europe')
    .sort((a, b) => {
      const aName = (a as any).first_name || a.name;
      const bName = (b as any).first_name || b.name;
      return aName.localeCompare(bName);
    });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin — Tournament Management</h1>

      {/* INTEGRATED TOURNAMENT SECTION */}
      <div>
        {/* Year Selection & Tournament Info */}
        <div className="mb-6 border p-6 rounded-lg bg-gradient-to-r from-blue-50 to-red-50">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Tournament Year</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))} 
                className="border-2 p-2 rounded text-lg font-bold"
              >
                {Array.from({ length: 9999 - 2020 + 1 }, (_, i) => 2020 + i).reverse().map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">Location</label>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                onBlur={saveHistoryData}
                placeholder="Enter tournament location..."
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold mb-1">Mini Post Tournament Write-up</label>
            <textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveHistoryData}
              placeholder="Write a brief summary of the tournament..."
              className="border p-2 rounded w-full h-32 resize-y"
            />
          </div>
          <div className="flex items-center justify-center gap-8 py-3 bg-white rounded border mt-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">🇺🇸 USA Score</div>
              <div className="text-3xl font-bold text-red-700">{calculateScores().usScore}</div>
            </div>
            <div className="text-2xl text-gray-400">-</div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">🇪🇺 Europe Score</div>
              <div className="text-3xl font-bold text-blue-700">{calculateScores().euScore}</div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4">Add Match Result</h2>

        <form onSubmit={handleMatchSubmit} className="mb-8 border p-6 rounded bg-gray-50">
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Game Type</label>
            <select 
              value={matchForm.game_type} 
              onChange={(e) => handleMatchFormChange('game_type', e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="scramble">Scramble</option>
              <option value="fourball">Fourball</option>
              <option value="foursomes">Foursomes</option>
              <option value="singles">Singles</option>
              <option value="tip_n_rip">Tip N Rip</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* USA Team */}
            <div className="border-2 border-red-700 p-4 rounded bg-red-50">
              <h3 className="font-bold text-red-900 mb-3">🇺🇸 USA Team</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Player 1</label>
                  <select 
                    value={matchForm.team1_player1_id || ''} 
                    onChange={(e) => handleMatchFormChange('team1_player1_id', Number(e.target.value))}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select player...</option>
                    {usaPlayers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                {matchForm.game_type !== 'singles' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1">Player 2</label>
                    <select 
                      value={matchForm.team1_player2_id || ''} 
                      onChange={(e) => handleMatchFormChange('team1_player2_id', Number(e.target.value))}
                      className="border p-2 rounded w-full"
                    >
                      <option value="">Select player...</option>
                      {usaPlayers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Europe Team */}
            <div className="border-2 border-blue-800 p-4 rounded bg-blue-50">
              <h3 className="font-bold text-blue-900 mb-3">🇪🇺 Europe Team</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Player 1</label>
                  <select 
                    value={matchForm.team2_player1_id || ''} 
                    onChange={(e) => handleMatchFormChange('team2_player1_id', Number(e.target.value))}
                    className="border p-2 rounded w-full"
                  >
                    <option value="">Select player...</option>
                    {europePlayers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                {matchForm.game_type !== 'singles' && (
                  <div>
                    <label className="block text-sm font-semibold mb-1">Player 2</label>
                    <select 
                      value={matchForm.team2_player2_id || ''} 
                      onChange={(e) => handleMatchFormChange('team2_player2_id', Number(e.target.value))}
                      className="border p-2 rounded w-full"
                    >
                      <option value="">Select player...</option>
                      {europePlayers.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Game Result */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Result (from USA perspective)</label>
            <select 
              value={matchForm.result} 
              onChange={(e) => handleMatchFormChange('result', e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="W">Win (USA)</option>
              <option value="L">Loss (USA)</option>
              <option value="D">Draw</option>
            </select>
          </div>

          <div className="flex gap-2 mt-6">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-semibold">
              {editingMatchId ? 'Update Match' : 'Save Match'}
            </button>
            {editingMatchId && (
              <button 
                type="button" 
                onClick={() => {
                  setEditingMatchId(null)
                  setMatchForm({
                    year: selectedYear,
                    game_type: 'scramble',
                    team1_player1_id: null,
                    team1_player2_id: null,
                    team2_player1_id: null,
                    team2_player2_id: null,
                    result: 'W'
                  })
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
            <Link href={`/results?year=${selectedYear}`} className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              View Full Results Page
            </Link>
          </div>
        </form>

        {/* Existing Matches */}
        <div>
          <h3 className="text-lg font-bold mb-3">Existing Matches for {selectedYear}</h3>
          {Object.keys(groupedMatches).length === 0 ? (
            <p className="text-gray-500">No matches recorded for this year.</p>
          ) : (
            <div className="space-y-6">
              {Object.keys(groupedMatches).sort().map(gameType => {
                const games = groupedMatches[gameType]
                return (
                  <div key={gameType} className="border rounded bg-white">
                    <div className="bg-gray-100 px-4 py-2 font-bold border-b uppercase">{gameType}</div>
                    <div className="divide-y">
                      {games.map(game => (
                        <div key={game.id} className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm text-gray-700 mb-1">
                              <span className="font-semibold text-red-700">USA:</span> {game.team1_player1_name} & {game.team1_player2_name}
                              <span className="mx-2">vs</span>
                              <span className="font-semibold text-blue-700">Europe:</span> {game.team2_player1_name} & {game.team2_player2_name}
                            </div>
                            <div className="text-sm">
                              <span className="font-semibold">Result: </span>
                              <span className={game.result === 'W' ? 'text-red-700 font-bold' : game.result === 'L' ? 'text-blue-700 font-bold' : 'text-gray-600'}>
                                {game.result === 'W' ? 'USA Win' : game.result === 'L' ? 'Europe Win' : 'Draw'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => startEditMatch(game.id!)} className="px-3 py-1 border rounded hover:bg-gray-100 text-sm">Edit</button>
                            <button onClick={() => handleDeleteMatch(game.id!)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
