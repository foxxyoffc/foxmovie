// lib/cache.ts
import { kv } from '@vercel/kv';

const CACHE_TTL = 3600; // 1 hour
const LONG_CACHE_TTL = 86400; // 24 hours

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const data = await kv.get(key);
    return data as T || null;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, data: T, ttl: number = CACHE_TTL): Promise<void> {
  try {
    await kv.set(key, data, { ex: ttl });
  } catch {
    // Redis not available, skip caching
  }
}

export async function deleteCached(key: string): Promise<void> {
  try {
    await kv.del(key);
  } catch {
    // Ignore
  }
}

// Cache keys
export const CACHE_KEYS = {
  SEARCH: (query: string) => `search:${query.toLowerCase()}`,
  ANIME_DETAIL: (slug: string) => `anime:${slug}`,
  EPISODE_STREAMS: (episodeId: string) => `streams:${episodeId}`,
  POPULAR: 'popular',
  TRENDING: 'trending',
};
