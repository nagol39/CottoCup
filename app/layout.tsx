import './globals.css'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Ryder Cup',
  description: 'Annual Ryder Cup tournament site',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
  <header className="bg-blue-900 text-white shadow">
          <nav className="max-w-6xl mx-auto flex items-center justify-between p-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <span className="font-bold text-lg">RC</span>
              </div>
              <span className="text-2xl font-bold">Ryder Cup</span>
            </Link>
            <div className="space-x-2 flex items-center">
              <Link href="/" className="nav-link px-6 py-3 text-white font-semibold transition bg-transparent hover:text-gray-900 rounded-none">Home</Link>
              <div className="relative group inline-block">
                <span className="nav-link cursor-pointer text-white font-semibold px-6 py-3 transition bg-transparent group-hover:text-gray-900 rounded-none flex items-center">
                  Information/Rules <span className="ml-2">&#9660;</span>
                </span>
                <div className="absolute left-5 mt-4 w-48 bg-blue-100 border border-gray-200 rounded-b shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <Link href="/information" className="block px-4 py-3 text-gray-900 hover:bg-blue-900 hover:text-white transition">Information</Link>
                  <Link href="/game-format" className="block px-4 py-3 text-gray-900 hover:bg-blue-900 hover:text-white transition">Game Format/Rules</Link>
                  <Link href="/schedule" className="block px-4 py-3 text-gray-900 hover:bg-blue-900 hover:text-white transition">Schedule</Link>
                  <Link href="/news" className="block px-4 py-3 text-gray-900 hover:bg-blue-900 hover:text-white transition">News</Link>
                </div>
              </div>
              <Link href="/statistics" className="nav-link px-6 py-3 text-white font-semibold transition bg-transparent hover:text-gray-900 rounded-none">Statistics</Link>
              <Link href="/photos" className="nav-link px-6 py-3 text-white font-semibold transition bg-transparent hover:text-gray-900 rounded-none">Photos</Link>
              
              <Link href="/shop" className="nav-link px-6 py-3 text-white font-semibold transition bg-transparent hover:text-gray-900 rounded-none">Shop</Link>
            </div>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="bg-blue-900 text-white text-center py-6 mt-12">
          © {new Date().getFullYear()} Ryder Cup. All Rights Reserved.
        </footer>
      </body>
    </html>
  )
}
