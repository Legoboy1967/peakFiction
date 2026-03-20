export interface UserStats {
  averageRating: number;
  totalRatings: number;
  hundredsCount: number;
}

export function calculateModifiedScore(rawScore: number, stats: UserStats): { modifiedScore: number; weight: number } {
  let score = rawScore;
  const { averageRating, totalRatings, hundredsCount } = stats;

  // 1. 100s Clause
  if (score === 100 && hundredsCount >= 3) {
    score = 90;
  }

  // 2. Skew
  if (averageRating > 70) {
    const penalty = Math.ceil(averageRating) - 70;
    score = score - penalty;
  }

  // 3. Hater's Floor
  if (averageRating < 45 && rawScore < 45) {
    score = score + 15;
  }

  // 4. Weight (Rater's Credibility)
  const weight = 1 + Math.floor(totalRatings / 50);

  return { modifiedScore: score, weight };
}

export function calculateArtworkFinalScore(ratings: { modifiedScore: number; weight: number }[]): number {
  if (ratings.length === 0) return 0;

  // Flatten ratings based on weight
  const flattenedScores: number[] = [];
  ratings.forEach(r => {
    for (let i = 0; i < r.weight; i++) {
      flattenedScores.push(r.modifiedScore);
    }
  });

  const max = Math.max(...flattenedScores);
  const min = Math.min(...flattenedScores);

  let finalScore: number;

  // Opp Blocker Rule V2
  if (max - min > 50) {
    const sorted = [...flattenedScores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      finalScore = (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
      finalScore = sorted[mid];
    }
  } else {
    const sum = flattenedScores.reduce((a, b) => a + b, 0);
    finalScore = sum / flattenedScores.length;
  }

  return Math.ceil(finalScore);
}
