// app/watch/[episodeId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, AlertCircle } from 'lucide-react';

interface Stream {
  quality: string;
  url: string;
  source: string;
}

export default function WatchPage() {
  const { episodeId } = useParams();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (episodeId) {
      fetchStreams();
    }
  }, [episodeId]);

  const fetchStreams = async () => {
    try {
      const res = await fetch(`/api/stream/${episodeId}`);
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setStreams(data);
        setSelectedStream(data[0] || null);
      }
    } catch (error) {
      setError('Gagal memuat stream');
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

  if (error || !selectedStream) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-400">Gagal Memuat Video</h1>
        <p className="text-gray-400 mt-2">{error || 'Tidak ada stream tersedia'}</p>
        <Link href="/" className="inline-block mt-4 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4">
        <ChevronLeft className="w-5 h-5" />
        Kembali
      </Link>

      {/* Player */}
      <div className="bg-black rounded-lg overflow-hidden aspect-video">
        <iframe
          src={selectedStream.url}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media"
          sandbox="allow-same-origin allow-scripts allow-forms allow-presentation"
        />
      </div>

      {/* Stream quality selector */}
      {streams.length > 1 && (
        <div className="mt-4 flex gap-2">
          <span className="text-sm text-gray-400 mr-2">Kualitas:</span>
          {streams.map((stream) => (
            <button
              key={stream.quality}
              onClick={() => setSelectedStream(stream)}
              className={`px-3 py-1 rounded text-sm ${
                selectedStream === stream
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {stream.quality}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
