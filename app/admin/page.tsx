import Link from 'next/link'

export default function AdminIndex() {
  return (
    <main className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6">Admin</h1>
        <p className="text-sm text-gray-600 mb-6">Choose an area to manage.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/admin/players" className="block p-6 border rounded-lg hover:shadow-md text-center">
            <div className="text-xl font-semibold">Players</div>
            <div className="text-sm text-gray-500 mt-2">Add, edit, and remove players.</div>
          </Link>

          <Link href="/admin/history" className="block p-6 border rounded-lg hover:shadow-md text-center">
            <div className="text-xl font-semibold">History</div>
            <div className="text-sm text-gray-500 mt-2">Manage year results and team selection.</div>
          </Link>
        </div>
      </div>
    </main>
  )
}
