// app/api/popular/route.ts
import { NextResponse } from 'next/server';
import { getPopularAnime } from '@/lib/database';
import { getCached, setCached, CACHE_KEYS } from '@/lib/cache';

export async function GET() {
  // Check cache
  const cached = await getCached(CACHE_KEYS.POPULAR);
  if (cached) {
    return NextResponse.json(cached);
  }
  
  try {
    const anime = await getPopularAnime(20);
    await setCached(CACHE_KEYS.POPULAR, anime, 86400); // 24 hours
    return NextResponse.json(anime);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get popular anime' }, { status: 500 });
  }
}
