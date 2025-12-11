import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 text-blue-900">Ryder Cup</h1>
        <p className="text-base sm:text-lg mb-6 sm:mb-8 px-2">Team Europe (Blue) vs Team USA (Red) — Annual friendly competition.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 max-w-sm sm:max-w-none mx-auto">
          <Link href="/all-players" className="px-5 py-3 bg-red-600 text-white rounded-md font-semibold hover:opacity-90 transition">View Players</Link>
          <Link href="/photos" className="px-5 py-3 bg-white border border-gray-200 rounded-md hover:shadow transition">Photos</Link>
        </div>
      </div>
    </main>
  )
}