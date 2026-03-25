'use server'

import { prisma } from '@/lib/prisma'
import { calculateModifiedScore, calculateArtworkFinalScore } from '@/lib/ratingEngine'
import { revalidatePath } from 'next/cache'

export async function submitRating(artworkTitle: string, rawScore: number, userId: string) {
  // 1. Find or create user
  let user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    // If user doesn't exist, create a dummy one for now (since we don't have full auth)
    user = await prisma.user.create({
      data: { id: userId, name: userId }
    });
  }

  // 2. Find or create artwork
  let artwork = await prisma.artwork.findFirst({
    where: { title: artworkTitle }
  });

  if (!artwork) {
    artwork = await prisma.artwork.create({
      data: { title: artworkTitle }
    });
  }

  // 3. Check if rating exists
  const existingRating = await prisma.rating.findUnique({
    where: {
      userId_artworkId: {
        userId: user.id,
        artworkId: artwork.id
      }
    }
  });

  if (existingRating) {
    throw new Error('You have already rated this artwork.');
  }

  // 4. Calculate modified score
  const { modifiedScore, weight } = calculateModifiedScore(rawScore, {
    averageRating: user.averageRating,
    totalRatings: user.totalRatings,
    hundredsCount: user.hundredsCount
  });

  // 5. Create rating
  await prisma.rating.create({
    data: {
      userId: user.id,
      artworkId: artwork.id,
      rawScore,
      modifiedScore,
      weight
    }
  });

  // 6. Update user stats
  const userRatings = await prisma.rating.findMany({
    where: { userId: user.id }
  });
  
  const totalRatingsCount = userRatings.length;
  const averageRating = userRatings.reduce((a, b) => a + b.rawScore, 0) / totalRatingsCount;
  const hundredsCount = userRatings.filter(r => r.rawScore === 100).length;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      averageRating,
      totalRatings: totalRatingsCount,
      hundredsCount
    }
  });

  // 7. Update artwork stats (Final Score)
  const artworkRatings = await prisma.rating.findMany({
    where: { artworkId: artwork.id }
  });

  const finalScore = calculateArtworkFinalScore(artworkRatings);
  
  await prisma.artwork.update({
    where: { id: artwork.id },
    data: {
      finalScore,
      ratingCount: artworkRatings.length
    }
  });

  revalidatePath('/');
}
