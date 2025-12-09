import './globals.css'
import Link from 'next/link'
import Image from 'next/image'
import MobileNav from './components/MobileNav'

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
            <MobileNav />
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
