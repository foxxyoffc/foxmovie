// lib/database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function saveAnime(data: any) {
  return prisma.anime.upsert({
    where: { slug: data.slug },
    update: {
      title: data.title,
      description: data.description,
      coverImage: data.coverImage,
      year: data.year,
      status: data.status,
      genre: data.genre,
      totalEpisodes: data.totalEpisodes,
      updatedAt: new Date(),
    },
    create: {
      title: data.title,
      slug: data.slug,
      description: data.description || '',
      coverImage: data.coverImage || '',
      year: data.year || 0,
      status: data.status || 'Unknown',
      genre: data.genre || [],
      totalEpisodes: data.totalEpisodes || 0,
    },
  });
}

export async function saveEpisode(animeId: string, data: any) {
  return prisma.episode.upsert({
    where: {
      animeId_number: {
        animeId: animeId,
        number: data.number,
      },
    },
    update: {
      title: data.title,
      thumbnail: data.thumbnail,
    },
    create: {
      animeId: animeId,
      number: data.number,
      title: data.title || `Episode ${data.number}`,
      thumbnail: data.thumbnail || '',
    },
  });
}

export async function saveStream(episodeId: string, data: any) {
  return prisma.stream.create({
    data: {
      episodeId: episodeId,
      quality: data.quality,
      url: data.url,
      source: data.source,
    },
  });
}

export async function getAnimeBySlug(slug: string) {
  return prisma.anime.findUnique({
    where: { slug },
    include: {
      episodes: {
        orderBy: { number: 'asc' },
        include: {
          streams: true,
        },
      },
    },
  });
}

export async function getPopularAnime(limit: number = 20) {
  return prisma.anime.findMany({
    orderBy: { totalEpisodes: 'desc' },
    take: limit,
  });
}

export async function searchAnimeDB(query: string) {
  return prisma.anime.findMany({
    where: {
      title: {
        contains: query,
        mode: 'insensitive',
      },
    },
    take: 20,
  });
}
