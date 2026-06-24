// app/api/auto-update/route.ts
import { NextResponse } from 'next/server';
import { searchAnime, getAnimeDetail } from '@/lib/scraper';
import { saveAnime, saveEpisode, saveStream } from '@/lib/database';
import { deleteCached, CACHE_KEYS } from '@/lib/cache';

// List of popular anime to auto-update
const POPULAR_ANIME = [
  'one piece',
  'naruto',
  'attack on titan',
  'jujutsu kaisen',
  'demon slayer',
  'my hero academia',
  'spy x family',
  'chainsaw man',
  'bleach',
  'dragon ball',
  'solo leveling',
  'tower of god',
  'the god of high school',
  'overlord',
  're zero',
];

export async function GET() {
  try {
    const results = [];
    
    for (const title of POPULAR_ANIME) {
      try {
        // Search for the anime
        const searchResults = await searchAnime(title);
        
        if (searchResults.length > 0) {
          const animeData = searchResults[0];
          
          // Get detailed info
          const detail = await getAnimeDetail(animeData.url, animeData.source);
          
          if (detail) {
            // Save to database
            const savedAnime = await saveAnime(detail);
            
            // Save episodes
            for (const episode of detail.episodes) {
              const savedEpisode = await saveEpisode(savedAnime.id, episode);
              
              // Save streams
              for (const stream of episode.streams) {
                await saveStream(savedEpisode.id, stream);
              }
            }
            
            results.push({
              title: detail.title,
              episodes: detail.episodes.length,
              status: 'success',
            });
          }
        }
      } catch (e) {
        results.push({
          title: title,
          status: 'failed',
          error: String(e),
        });
      }
    }
    
    // Clear cache
    await deleteCached(CACHE_KEYS.POPULAR);
    
    return NextResponse.json({
      status: 'success',
      updated: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: String(error) },
      { status: 500 }
    );
  }
}
