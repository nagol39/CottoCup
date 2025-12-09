'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button - Mobile Only */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex flex-col gap-1.5 p-2"
        aria-label="Toggle menu"
      >
        <span className={`w-6 h-0.5 bg-white transition-transform ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
        <span className={`w-6 h-0.5 bg-white transition-opacity ${isOpen ? 'opacity-0' : ''}`}></span>
        <span className={`w-6 h-0.5 bg-white transition-transform ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
      </button>

      {/* Desktop Navigation - Hidden on Mobile */}
      <div className="hidden md:flex space-x-2 items-center">
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

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)}>
          <div 
            className="absolute top-0 right-0 w-64 h-full bg-blue-900 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-4">
              <button onClick={() => setIsOpen(false)} className="text-white text-2xl">&times;</button>
            </div>
            <nav className="flex flex-col">
              <Link href="/" className="px-6 py-4 text-white hover:bg-blue-800 transition" onClick={() => setIsOpen(false)}>Home</Link>
              <Link href="/information" className="px-6 py-4 text-white hover:bg-blue-800 transition" onClick={() => setIsOpen(false)}>Information</Link>
              <Link href="/game-format" className="px-6 py-4 text-white hover:bg-blue-800 transition" onClick={() => setIsOpen(false)}>Game Format/Rules</Link>
              <Link href="/schedule" className="px-6 py-4 text-white hover:bg-blue-800 transition" onClick={() => setIsOpen(false)}>Schedule</Link>
              <Link href="/news" className="px-6 py-4 text-white hover:bg-blue-800 transition" onClick={() => setIsOpen(false)}>News</Link>
              <Link href="/statistics" className="px-6 py-4 text-white hover:bg-blue-800 transition" onClick={() => setIsOpen(false)}>Statistics</Link>
              <Link href="/photos" className="px-6 py-4 text-white hover:bg-blue-800 transition" onClick={() => setIsOpen(false)}>Photos</Link>
              <Link href="/shop" className="px-6 py-4 text-white hover:bg-blue-800 transition" onClick={() => setIsOpen(false)}>Shop</Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
