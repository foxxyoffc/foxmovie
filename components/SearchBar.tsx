// components/SearchBar.tsx
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

interface Props {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari anime, donghua, atau film..."
        className="w-full px-4 py-3 pl-12 bg-gray-800 rounded-full border border-gray-700 focus:outline-none focus:border-red-500 text-white placeholder-gray-400"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded-full text-sm font-medium"
      >
        Cari
      </button>
    </form>
  );
}
