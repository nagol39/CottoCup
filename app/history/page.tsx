import React from 'react'
import Link from 'next/link'

type YearItem = {
  year: number
  usScore?: string
  euScore?: string
  location?: string
}

const years: YearItem[] = [
  { year: 2025, usScore: '13', euScore: '15', location: 'Bethpage Black' },
  { year: 2024, usScore: undefined, euScore: undefined, location: undefined },
  { year: 2023, usScore: undefined, euScore: undefined, location: undefined },
  { year: 2022, usScore: undefined, euScore: undefined, location: undefined },
  { year: 2021, usScore: undefined, euScore: undefined, location: undefined },
  { year: 2020, usScore: undefined, euScore: undefined, location: undefined },
]

function TeamListPlaceholder({ side }: { side: 'US' | 'EU' }) {
  const players = new Array(6).fill(null).map((_, i) => ({ name: `${side} Player ${i + 1}` }))

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">{side} Team</h4>
      <div className="grid grid-cols-2 gap-3">
        {players.map((p, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">img</div>
            <div className="text-xs text-gray-700">{p.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExpandedContent({ item }: { item: YearItem }) {
  return (
    <div className="mt-6">
      <div className="grid md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-4">
          <TeamListPlaceholder side="US" />
        </div>

        <div className="md:col-span-4 flex flex-col items-center">
          <div className="w-full bg-gray-100 rounded-lg overflow-hidden shadow-sm">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center text-gray-500">Image / Gallery</div>
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
          <TeamListPlaceholder side="EU" />

          <div className="text-sm text-gray-700">
            <p className="mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. This is a placeholder description for the event — you can edit results and text later.</p>
            <p className="text-xs text-gray-500">Summary and notable events go here. Replace with the real content when ready.</p>
          </div>

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
  return (
    <div className="w-full flex items-center justify-between py-6">
      <div className="flex items-center gap-6">
        <div className="text-lg font-semibold tracking-wide">{item.year}</div>
        <div className="h-6 w-px bg-gray-200" />

        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-gray-400">{item.usScore ?? '—'}</div>
          <div className="text-sm">🇺🇸</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-blue-600">{item.euScore ?? '—'}</div>
          <div className="text-sm">🇪🇺</div>
          <div className="text-yellow-500">🏆</div>
        </div>

        <div className="h-6 w-px bg-gray-200" />
        <div className="text-sm text-gray-700">{item.location ?? 'Location TBD'}</div>
      </div>

      <div className="text-sm text-gray-600">More Info ➜</div>
    </div>
  )
}

export default function HistoryPage() {
  const totals = years.reduce(
    (acc, y) => {
      const us = Number(y.usScore)
      const eu = Number(y.euScore)
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
          {years.map((y) => (
            <details key={y.year} className="group bg-white border border-gray-100 rounded-md">
              <summary className="list-none cursor-pointer px-6 md:px-8 lg:px-10">
                <YearRowSummary item={y} />
              </summary>
              <div className="px-6 md:px-8 lg:px-10 pb-6">
                <ExpandedContent item={y} />
              </div>
            </details>
          ))}
        </div>
      </div>
    </main>
  )
}
