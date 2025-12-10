'use client'

import React, { useEffect, useState } from 'react'

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
  us_players?: number[]
  eu_players?: number[]
  notes?: string
}

export default function AdminHistory() {
  const [players, setPlayers] = useState<Player[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [form, setForm] = useState<HistoryItem>({ year: new Date().getFullYear() })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchPlayers()
    fetchHistory()
  }, [])

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
      // parse player JSON fields if present
      const parsed = data.map((d: any) => ({
        ...d,
        us_players: d.us_players ? JSON.parse(d.us_players) : [],
        eu_players: d.eu_players ? JSON.parse(d.eu_players) : [],
      }))
      setHistory(parsed)
    } catch (err) {
      console.error(err)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  function togglePlayer(side: 'us_players' | 'eu_players', id: number) {
    const list = (form as any)[side] || []
    if (list.includes(id)) {
      (form as any)[side] = list.filter((x: number) => x !== id)
    } else {
      (form as any)[side] = [...list, id]
    }
    setForm({ ...form })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = { ...form }
      const url = '/api/history'
      const method = editingId ? 'PUT' : 'POST'
      if (editingId) (payload as any).id = editingId
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Save failed')
      setForm({ year: new Date().getFullYear() })
      setEditingId(null)
      await fetchHistory()
    } catch (err) {
      console.error(err)
      alert('Failed to save')
    }
  }

  function startEdit(item: HistoryItem) {
    setEditingId(item.id ?? null)
    setForm({
      id: item.id,
      year: item.year,
      us_score: item.us_score,
      eu_score: item.eu_score,
      location: item.location,
      us_players: item.us_players || [],
      eu_players: item.eu_players || [],
      notes: item.notes || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleDelete(id?: number) {
    if (!id) return
    if (!confirm('Delete this history entry?')) return
    try {
      const res = await fetch('/api/history', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      if (!res.ok) throw new Error('Delete failed')
      await fetchHistory()
    } catch (err) {
      console.error(err)
      alert('Failed to delete')
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin — History</h1>

      <form onSubmit={handleSubmit} className="mb-8 border p-4 rounded">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold">Year</label>
            <input type="number" name="year" value={form.year as any} onChange={handleChange} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold">Location</label>
            <input type="text" name="location" value={form.location || ''} onChange={handleChange} className="border p-2 rounded w-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-semibold mb-2">United States — select players</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2">
              {players.filter(p => p.team === 'USA').map(p => (
                <label key={p.id} className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={(form.us_players || []).includes(p.id)} onChange={() => togglePlayer('us_players', p.id)} />
                  <span className="text-sm">{p.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Europe — select players</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-2">
              {players.filter(p => p.team === 'Europe').map(p => (
                <label key={p.id} className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={(form.eu_players || []).includes(p.id)} onChange={() => togglePlayer('eu_players', p.id)} />
                  <span className="text-sm">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold">Result (US)</label>
          <input type="text" name="us_score" value={form.us_score || ''} onChange={handleChange} className="border p-2 rounded w-full" />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold">Result (EU)</label>
          <input type="text" name="eu_score" value={form.eu_score || ''} onChange={handleChange} className="border p-2 rounded w-full" />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-semibold">Notes</label>
          <textarea name="notes" value={form.notes || ''} onChange={handleChange} className="border p-2 rounded w-full h-24" />
        </div>

        <div className="flex gap-2 mt-4">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Create'}</button>
          {editingId && (<button type="button" onClick={() => { setEditingId(null); setForm({ year: new Date().getFullYear() }); }} className="px-4 py-2 border rounded">Cancel</button>)}
        </div>
      </form>

      <div>
        <h2 className="text-xl font-bold mb-3">Existing Entries</h2>
        <div className="space-y-2">
          {history.map(h => (
            <div key={h.id} className="border p-3 rounded flex items-center justify-between">
              <div>
                <div className="font-semibold">{h.year} — {h.location || 'Location TBD'}</div>
                <div className="text-sm text-gray-600">Result: {h.us_score ?? '—'} 🇺🇸  —  {h.eu_score ?? '—'} 🇪🇺</div>
                <div className="text-sm text-gray-500">US players: {(h.us_players || []).map(id => players.find(p => p.id === id)?.name).filter(Boolean).join(', ')}</div>
                <div className="text-sm text-gray-500">EU players: {(h.eu_players || []).map(id => players.find(p => p.id === id)?.name).filter(Boolean).join(', ')}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(h)} className="px-3 py-1 border rounded">Edit</button>
                <button onClick={() => handleDelete(h.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
