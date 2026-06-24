// lib/scraper.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import { SOURCES } from './sources';

// Interface untuk hasil scraping
export interface ScrapedAnime {
  title: string;
  slug: string;
  coverImage: string;
  description: string;
  year: number;
  status: string;
  genre: string[];
  rating: number;
  totalEpisodes: number;
  episodes: ScrapedEpisode[];
  source: string;
  externalId: string;
  url: string;
}

export interface ScrapedEpisode {
  number: number;
  title?: string;
  thumbnail?: string;
  streams: {
    quality: string;
    url: string;
    source: string;
  }[];
}

// ============ SEARCH ANIME ============
export async function searchAnime(query: string): Promise<ScrapedAnime[]> {
  const results: ScrapedAnime[] = [];
  
  for (const source of SOURCES) {
    try {
      const searchUrl = `${source.baseUrl}${source.searchEndpoint}${encodeURIComponent(query)}`;
      console.log(`Searching ${source.name}: ${searchUrl}`);
      
      const { data } = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        timeout: 10000,
      });
      
      const $ = cheerio.load(data);
      
      // Extract berdasarkan struktur masing-masing source
      const items = extractSearchResults($, source);
      results.push(...items.map(item => ({ ...item, source: source.name })));
      
    } catch (error) {
      console.error(`Failed to search from ${source.name}:`, error);
      continue;
    }
  }
  
  return results;
}

// ============ EXTRACT SEARCH RESULTS ============
function extractSearchResults($: cheerio.CheerioAPI, source: any): ScrapedAnime[] {
  const items: ScrapedAnime[] = [];
  
  // Selector yang umum dipakai
  const selectors = [
    '.anime-list .item',
    '.film-list .item',
    '.anime-item',
    '.items .item',
    '.search-results .result',
  ];
  
  let found = false;
  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      elements.each((i, el) => {
        const title = $(el).find('.title, h3, .name').text().trim() || 
                     $(el).find('a').first().attr('title') || 
                     'Unknown';
        const link = $(el).find('a').first().attr('href') || '';
        const image = $(el).find('img').attr('src') || 
                     $(el).find('img').attr('data-src') || 
                     '';
        const episodesText = $(el).find('.episode, .eps, .total-episodes').text().trim();
        const episodes = parseInt(episodesText) || 0;
        
        if (title && link) {
          items.push({
            title: title,
            slug: generateSlug(title),
            coverImage: fixImageUrl(image, source.baseUrl),
            description: '',
            year: 0,
            status: 'Unknown',
            genre: [],
            rating: 0,
            totalEpisodes: episodes,
            episodes: [],
            source: source.name,
            externalId: extractIdFromUrl(link),
            url: fixUrl(link, source.baseUrl),
          });
        }
      });
      found = true;
      break;
    }
  }
  
  // Fallback: cari semua link yang mengandung "anime"
  if (!found) {
    $('a[href*="anime"]').each((i, el) => {
      const href = $(el).attr('href');
      const title = $(el).text().trim() || $(el).attr('title') || 'Unknown';
      if (href && title.length > 2) {
        items.push({
          title: title,
          slug: generateSlug(title),
          coverImage: '',
          description: '',
          year: 0,
          status: 'Unknown',
          genre: [],
          rating: 0,
          totalEpisodes: 0,
          episodes: [],
          source: source.name,
          externalId: extractIdFromUrl(href),
          url: fixUrl(href, source.baseUrl),
        });
      }
    });
  }
  
  return items.slice(0, 20); // Limit 20 results
}

// ============ GET ANIME DETAIL ============
export async function getAnimeDetail(url: string, sourceName: string): Promise<ScrapedAnime | null> {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });
    
    const $ = cheerio.load(data);
    
    // Extract detail
    const title = $('.anime-title, h1.title, .title').first().text().trim() || 
                 $('h1').first().text().trim() || 
                 'Unknown';
    
    const description = $('.description, .synopsis, .summary').text().trim() || 
                       $('.anime-detail .info p').text().trim() || '';
    
    const coverImage = $('.anime-poster img, .cover img, .poster img').attr('src') || 
                      $('img.cover').attr('src') || '';
    
    // Extract episodes
    const episodes: ScrapedEpisode[] = [];
    const episodeSelectors = [
      '.episodes .episode-item',
      '.episode-list .item',
      '.episode-item',
      '.episodes li',
    ];
    
    for (const sel of episodeSelectors) {
      $(sel).each((i, el) => {
        const epNum = parseInt($(el).find('.episode-number, .num, .number').text()) || i + 1;
        const epTitle = $(el).find('.episode-title, .title').text().trim();
        const epLink = $(el).find('a').attr('href') || '';
        const epThumb = $(el).find('img').attr('src') || '';
        
        episodes.push({
          number: epNum,
          title: epTitle || `Episode ${epNum}`,
          thumbnail: fixImageUrl(epThumb, url),
          streams: [],
        });
      });
      if (episodes.length > 0) break;
    }
    
    // Extract genre
    const genres: string[] = [];
    $('.genre, .categories, .tags a').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 1) genres.push(text);
    });
    
    // Extract year
    const yearText = $('.year, .release-year, .aired').text().trim();
    const year = parseInt(yearText) || 0;
    
    // Extract status
    const statusText = $('.status, .released').text().trim();
    const status = statusText.includes('Ongoing') ? 'Ongoing' : 
                   statusText.includes('Completed') ? 'Completed' : 
                   'Unknown';
    
    return {
      title,
      slug: generateSlug(title),
      coverImage: fixImageUrl(coverImage, url),
      description: description.substring(0, 1000),
      year,
      status,
      genre: genres.slice(0, 10),
      rating: 0,
      totalEpisodes: episodes.length,
      episodes,
      source: sourceName,
      externalId: extractIdFromUrl(url),
      url: url,
    };
  } catch (error) {
    console.error('Failed to get anime detail:', error);
    return null;
  }
}

// ============ GET STREAM LINK ============
export async function getStreamLinks(episodeUrl: string): Promise<{ quality: string; url: string; source: string }[]> {
  try {
    const { data } = await axios.get(episodeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });
    
    const $ = cheerio.load(data);
    const streams: { quality: string; url: string; source: string }[] = [];
    
    // Cari iframe atau link video
    const iframe = $('iframe').first().attr('src');
    if (iframe) {
      streams.push({
        quality: '720p',
        url: fixUrl(iframe, episodeUrl),
        source: 'iframe',
      });
    }
    
    // Cari video source
    $('video source').each((i, el) => {
      const src = $(el).attr('src');
      const quality = $(el).attr('label') || $(el).attr('quality') || `${i === 0 ? '720' : '480'}p`;
      if (src) {
        streams.push({
          quality: quality,
          url: fixUrl(src, episodeUrl),
          source: 'direct',
        });
      }
    });
    
    // Cari link download/stream di berbagai source
    $('a[href*=".mp4"], a[href*=".m3u8"]').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        streams.push({
          quality: '480p',
          url: fixUrl(href, episodeUrl),
          source: 'direct',
        });
      }
    });
    
    return streams;
  } catch (error) {
    console.error('Failed to get stream links:', error);
    return [];
  }
}

// ============ HELPER FUNCTIONS ============
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function fixUrl(url: string, baseUrl: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) {
    const base = new URL(baseUrl);
    return `${base.origin}${url}`;
  }
  return `${baseUrl}/${url}`;
}

function fixImageUrl(url: string, baseUrl: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) {
    const base = new URL(baseUrl);
    return `${base.origin}${url}`;
  }
  return url;
}

function extractIdFromUrl(url: string): string {
  const match = url.match(/(?:anime|episode|watch)[\/\-](\d+)/i);
  return match ? match[1] : url.split('/').pop() || '';
}
