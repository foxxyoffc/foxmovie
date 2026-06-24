// app/api/search/route.ts
import { NextResponse } from 'next/server';
import { searchAnime } from '@/lib/scraper';
import { getCached, setCached, CACHE_KEYS } from '@/lib/cache';
import { saveAnime, saveEpisode } from '@/lib/database';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const source = searchParams.get('source') || 'all';
  
  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 });
  }
  
  // Check cache
  const cacheKey = CACHE_KEYS.SEARCH(query);
  const cached = await getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }
  
  try {
    // Scrape from sources
    const results = await searchAnime(query);
    
    // Save to database for persistence
    for (const anime of results) {
      try {
        await saveAnime(anime);
      } catch (e) {
        // Skip if already exists
      }
    }
    
    // Cache results
    await setCached(cacheKey, results, 1800); // 30 minutes
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
