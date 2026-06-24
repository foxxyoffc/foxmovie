// components/AnimeCard.tsx
import Link from 'next/link';
import Image from 'next/image';

interface Props {
  anime: {
    id?: string;
    slug: string;
    title: string;
    coverImage: string;
    totalEpisodes?: number;
    year?: number;
    status?: string;
  };
}

export default function AnimeCard({ anime }: Props) {
  return (
    <Link href={`/anime/${anime.slug}`}>
      <div className="group bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition-all">
        <div className="relative aspect-[2/3]">
          {anime.coverImage ? (
            <img
              src={anime.coverImage}
              alt={anime.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}
          {anime.totalEpisodes !== undefined && anime.totalEpisodes > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
              EP {anime.totalEpisodes}
            </div>
          )}
          {anime.status && (
            <div className="absolute top-2 left-2 bg-red-600 px-2 py-0.5 rounded text-xs font-medium">
              {anime.status === 'Ongoing' ? 'Ongoing' : anime.status === 'Completed' ? 'Completed' : anime.status}
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-red-400 transition">
            {anime.title}
          </h3>
          {anime.year && (
            <p className="text-xs text-gray-400 mt-1">{anime.year}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
