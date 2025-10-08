import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-extrabold mb-4 text-blue-900">Ryder Cup</h1>
        <p className="text-lg mb-8">Team Europe (Blue) vs Team USA (Red) — Annual friendly competition.</p>
        <div className="flex justify-center gap-4">
          <Link href="/statistics" className="px-5 py-3 bg-red-600 text-white rounded-md font-semibold hover:opacity-90">View Statistics</Link>
          <Link href="/photos" className="px-5 py-3 bg-white border border-gray-200 rounded-md hover:shadow">Photos</Link>
        </div>
      </div>
    </main>
  )
}