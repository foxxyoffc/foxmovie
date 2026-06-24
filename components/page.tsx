// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import AnimeCard from '@/components/AnimeCard';
import SearchBar from '@/components/SearchBar';

interface Anime {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  description: string;
  year: number;
  status: string;
  genre: string[];
  totalEpisodes: number;
}

export default function Home() {
  const [popular, setPopular] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchPopular();
  }, []);

  const fetchPopular = async () => {
    try {
      const res = await fetch('/api/popular');
      const data = await res.json();
      setPopular(data);
    } catch (error) {
      console.error('Failed to fetch popular:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const displayAnime = isSearching ? searchResults : popular;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Nonton Anime & Donghua</h1>
        <SearchBar onSearch={handleSearch} />
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        {isSearching ? 'Hasil Pencarian' : 'Populer Minggu Ini'}
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : displayAnime.length === 0 ? (
        <p className="text-gray-400 text-center py-12">Tidak ada hasil ditemukan</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayAnime.map((anime) => (
            <AnimeCard key={anime.id || anime.slug} anime={anime} />
          ))}
        </div>
      )}
    </div>
  );
}
