// app/api/anime/[slug]/route.ts
import { NextResponse } from 'next/server';
import { getAnimeBySlug } from '@/lib/database';
import { getAnimeDetail } from '@/lib/scraper';
import { getCached, setCached, CACHE_KEYS } from '@/lib/cache';

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  
  // Try cache
  const cacheKey = CACHE_KEYS.ANIME_DETAIL(slug);
  const cached = await getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }
  
  // Try database
  let anime = await getAnimeBySlug(slug);
  
  if (!anime) {
    // Scrape from source
    // Implementation to scrape detail from source
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  await setCached(cacheKey, anime, 3600);
  
  return NextResponse.json(anime);
}
