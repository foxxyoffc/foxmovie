// app/api/stream/[id]/route.ts
import { NextResponse } from 'next/server';
import { getStreamLinks } from '@/lib/scraper';
import { getCached, setCached, CACHE_KEYS } from '@/lib/cache';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  
  // Check cache
  const cacheKey = CACHE_KEYS.EPISODE_STREAMS(id);
  const cached = await getCached(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }
  
  try {
    // Get stream links from source
    const streams = await getStreamLinks(id);
    
    if (streams.length === 0) {
      return NextResponse.json({ error: 'No streams found' }, { status: 404 });
    }
    
    await setCached(cacheKey, streams, 3600);
    
    return NextResponse.json(streams);
  } catch (error) {
    console.error('Stream error:', error);
    return NextResponse.json({ error: 'Failed to get streams' }, { status: 500 });
  }
}
