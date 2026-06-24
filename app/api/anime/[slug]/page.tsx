// app/anime/[slug]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Play, Calendar, Clock, Tag } from 'lucide-react';

interface Episode {
  id: string;
  number: number;
  title: string;
  thumbnail: string | null;
}

interface AnimeDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  bannerImage: string | null;
  year: number;
  status: string;
  genre: string[];
  rating: number;
  totalEpisodes: number;
  episodes: Episode[];
}

export default function AnimeDetailPage() {
  const { slug } = useParams();
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchAnime();
    }
  }, [slug]);

  const fetchAnime = async () => {
    try {
      const res = await fetch(`/api/anime/${slug}`);
      const data = await res.json();
      setAnime(data);
    } catch (error) {
      console.error('Failed to fetch anime:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-400">Anime tidak ditemukan</h1>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative -mx-4 -mt-6">
        <div className="h-64 md:h-80 bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
          {anime.bannerImage ? (
            <img
              src={anime.bannerImage}
              alt={anime.title}
              className="w-full h-full object-cover opacity-50"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-red-900/30 to-blue-900/30"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        </div>
      </div>

      {/* Info */}
      <div className="relative -mt-20 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover */}
          <div className="w-48 md:w-56 flex-shrink-0 mx-auto md:mx-0">
            <img
              src={anime.coverImage || '/placeholder.jpg'}
              alt={anime.title}
              className="w-full rounded-lg shadow-2xl border-2 border-gray-700"
            />
          </div>

          {/* Details */}
          <div className="flex-1 pt-4 md:pt-0">
            <h1 className="text-3xl font-bold">{anime.title}</h1>
            
            <div className="flex flex-wrap gap-4 mt-2 text-sm">
              {anime.year > 0 && (
                <span className="flex items-center gap-1 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {anime.year}
                </span>
              )}
              <span className="flex items-center gap-1 text-gray-400">
                <Clock className="w-4 h-4" />
                {anime.status || 'Unknown'}
              </span>
              <span className="text-gray-400">
                {anime.totalEpisodes} Episode
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mt-3">
              {anime.genre.map((g) => (
                <span key={g} className="px-2 py-1 bg-gray-700 rounded-full text-xs">
                  {g}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm mt-4 line-clamp-3">
              {anime.description || 'Tidak ada deskripsi'}
            </p>
          </div>
        </div>
      </div>

      {/* Episodes */}
      <h2 className="text-2xl font-semibold mb-4">Daftar Episode</h2>
      
      {anime.episodes.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Episode belum tersedia</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {anime.episodes.map((ep) => (
            <Link
              key={ep.id}
              href={`/watch/${ep.id}`}
              className="group bg-gray-800 hover:bg-gray-700 rounded-lg p-3 text-center transition"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center mb-2">
                  <Play className="w-5 h-5 ml-0.5" />
                </div>
                <p className="text-sm font-medium">EP {ep.number}</p>
                <p className="text-xs text-gray-400 truncate w-full">
                  {ep.title || `Episode ${ep.number}`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
