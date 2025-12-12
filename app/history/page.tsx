'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type YearItem = {
  id?: number
  year: number
  us_score?: string
  eu_score?: string
  location?: string
  notes?: string
}

type Player = {
  id: number
  name: string
  team: string
  photo?: string
  slug: string
}

type Match = {
  id: number
  year: number
  team1_player1_id: number
  team1_player2_id: number
  team2_player1_id: number
  team2_player2_id: number
  team1_player1_name?: string
  team1_player2_name?: string
  team2_player1_name?: string
  team2_player2_name?: string
}

function TeamList({ side, players }: { side: 'US' | 'EU', players: Player[] }) {
  if (players.length === 0) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">{side === 'US' ? '🇺🇸 USA' : '🇪🇺 Europe'} Team</h4>
        <p className="text-xs text-gray-500">No players for this year</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">{side === 'US' ? '🇺🇸 USA' : '🇪🇺 Europe'} Team</h4>
      <div className="grid grid-cols-2 gap-3">
        {players.map((p) => (
          <Link key={p.id} href={`/players/${p.slug}`}>
            <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 overflow-hidden flex-shrink-0">
                {p.photo ? (
                  <img src={`/photos/players/${p.photo}`} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-base">{p.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="text-xs text-gray-700 hover:text-blue-600 font-medium">{p.name}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function ExpandedContent({ item, usPlayers, euPlayers }: { item: YearItem, usPlayers: Player[], euPlayers: Player[] }) {
  return (
    <div className="mt-6">
      <div className="grid md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-4">
          <TeamList side="US" players={usPlayers} />
        </div>

        <div className="md:col-span-4 flex flex-col items-center">
          <div className="w-full bg-gray-100 rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center text-gray-500 p-8">Image / Gallery</div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button className="p-2 rounded-full bg-white shadow">◀</button>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
            </div>
            <button className="p-2 rounded-full bg-white shadow">▶</button>
          </div>
        </div>

        <div className="md:col-span-4 space-y-4">
          <TeamList side="EU" players={euPlayers} />

          {item.notes && (
            <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded">
              <h5 className="font-semibold mb-2">Tournament Summary</h5>
              <p className="whitespace-pre-wrap">{item.notes}</p>
            </div>
          )}

          <div>
            <Link href={`/results?year=${item.year}`}>
              <button className="px-4 py-2 rounded-full bg-blue-800 text-white text-sm hover:bg-blue-900">
                Full Results
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function YearRowSummary({ item }: { item: YearItem }) {
  const usScore = item.us_score ? Number(item.us_score) : 0
  const euScore = item.eu_score ? Number(item.eu_score) : 0
  const winner = usScore > euScore ? 'us' : euScore > usScore ? 'eu' : 'tie'
  
  return (
    <div className="w-full flex items-center justify-between py-6">
      <div className="flex items-center gap-6">
        <div className="text-lg font-semibold tracking-wide">{item.year}</div>
        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-3">
          <div className={`text-2xl font-bold ${winner === 'us' ? 'text-red-600' : 'text-gray-400'}`}>
            {item.us_score ?? '—'}
          </div>
          <div className="text-sm">🇺🇸</div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`text-2xl font-bold ${winner === 'eu' ? 'text-blue-600' : 'text-gray-400'}`}>
            {item.eu_score ?? '—'}
          </div>
          <div className="text-sm">🇪🇺</div>
          {winner === 'eu' && <div className="text-yellow-500">🏆</div>}
          {winner === 'us' && <div className="text-yellow-500">🏆</div>}
        </div>

        <div className="h-6 w-px bg-gray-200" />
        <div className="text-sm text-gray-700">{item.location ?? 'Location TBD'}</div>
      </div>

      <div className="text-sm text-gray-600">More Info ➜</div>
    </div>
  )
}

export default function HistoryPage() {
  const [years, setYears] = useState<YearItem[]>([])
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [playersByYear, setPlayersByYear] = useState<{ [year: number]: { us: Player[], eu: Player[] } }>({})

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // Fetch history, players, and matches
      const [historyRes, playersRes, matchesRes] = await Promise.all([
        fetch('/api/history'),
        fetch('/api/admin'),
        fetch('/api/matches')
      ])

      const historyData: YearItem[] = await historyRes.json()
      const playersData: Player[] = await playersRes.json()
      const matchesData: Match[] = await matchesRes.json()

      setYears(historyData.sort((a, b) => b.year - a.year))
      setAllPlayers(playersData)
      setAllMatches(matchesData)

      // Build player lists per year from matches
      const playerMap: { [year: number]: { us: Set<number>, eu: Set<number> } } = {}
      
      matchesData.forEach(match => {
        if (!playerMap[match.year]) {
          playerMap[match.year] = { us: new Set(), eu: new Set() }
        }
        
        // USA team (team1)
        if (match.team1_player1_id) playerMap[match.year].us.add(match.team1_player1_id)
        if (match.team1_player2_id) playerMap[match.year].us.add(match.team1_player2_id)
        
        // Europe team (team2)
        if (match.team2_player1_id) playerMap[match.year].eu.add(match.team2_player1_id)
        if (match.team2_player2_id) playerMap[match.year].eu.add(match.team2_player2_id)
      })

      // Convert sets to player arrays
      const playersByYearObj: { [year: number]: { us: Player[], eu: Player[] } } = {}
      Object.keys(playerMap).forEach(yearStr => {
        const year = Number(yearStr)
        playersByYearObj[year] = {
          us: Array.from(playerMap[year].us)
            .map(id => playersData.find(p => p.id === id))
            .filter((p): p is Player => p !== undefined)
            .sort((a, b) => a.name.localeCompare(b.name)),
          eu: Array.from(playerMap[year].eu)
            .map(id => playersData.find(p => p.id === id))
            .filter((p): p is Player => p !== undefined)
            .sort((a, b) => a.name.localeCompare(b.name))
        }
      })

      setPlayersByYear(playersByYearObj)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
  }

  const totals = years.reduce(
    (acc, y) => {
      const us = Number(y.us_score)
      const eu = Number(y.eu_score)
      if (!isNaN(us) && !isNaN(eu)) {
        if (us > eu) acc.usWins += 1
        else if (eu > us) acc.euWins += 1
      }
      return acc
    },
    { usWins: 0, euWins: 0 }
  )

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-extrabold mb-6">History</h1>
        <p className="text-sm text-gray-600 mb-4">A timeline of competitions. Click a year to expand for more details.</p>

        {/* Standings header with aggregate wins */}
        <div className="w-full bg-white border-b border-gray-100 mb-6">
          <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">Wins</div>
              <div className="flex items-center gap-2">
                <div className="text-xs">🇺🇸</div>
                <div className="text-4xl font-extrabold text-red-600">{totals.usWins}</div>
              </div>
            </div>

            <div className="text-4xl text-yellow-500">🏆</div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="text-4xl font-extrabold text-blue-600">{totals.euWins}</div>
                <div className="text-xs">🇪🇺</div>
              </div>
              <div className="text-sm text-gray-500">Wins</div>
            </div>
          </div>
        </div>

        {/* Table-like header row: Year | Result | Location */}
        <div className="max-w-6xl mx-auto px-4 mb-4">
          <div className="grid grid-cols-12 items-center text-sm text-gray-500 py-3 border-b border-gray-100">
            <div className="col-span-2">Year</div>
            <div className="col-span-6">Result</div>
            <div className="col-span-3">Location</div>
            <div className="col-span-1 text-right"> </div>
          </div>
        </div>

        <div className="space-y-4">
          {years.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No tournament history yet. Create tournaments in the admin panel.
            </div>
          ) : (
            years.map((y) => {
              const usPlayers = playersByYear[y.year]?.us || []
              const euPlayers = playersByYear[y.year]?.eu || []
              
              return (
                <details key={y.year} className="group bg-white border border-gray-100 rounded-md">
                  <summary className="list-none cursor-pointer px-6 md:px-8 lg:px-10">
                    <YearRowSummary item={y} />
                  </summary>
                  <div className="px-6 md:px-8 lg:px-10 pb-6">
                    <ExpandedContent item={y} usPlayers={usPlayers} euPlayers={euPlayers} />
                  </div>
                </details>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
