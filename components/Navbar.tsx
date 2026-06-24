// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { Search, Film, Home, TrendingUp } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-red-500">
            <Film className="w-6 h-6" />
            AnimeStream
          </Link>
          
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-1 hover:text-red-400">
              <Home className="w-4 h-4" />
              Home
            </Link>
            <Link href="/popular" className="flex items-center gap-1 hover:text-red-400">
              <TrendingUp className="w-4 h-4" />
              Popular
            </Link>
            <Link href="/search" className="flex items-center gap-1 hover:text-red-400">
              <Search className="w-4 h-4" />
              Search
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
