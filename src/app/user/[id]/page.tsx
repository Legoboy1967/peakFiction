import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { notFound } from 'next/navigation'

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-score-high'
  if (score >= 50) return 'text-score-mid'
  return 'text-score-low'
}

function getMediaBadge(media: string | null): string {
  if (!media) return ''
  const map: Record<string, string> = {
    'Anime': '🎬', 'Manga': '📖', 'Novel': '📚', 'Manhwa': '🇰🇷',
    'Manhua': '🇨🇳', 'Movie': '🎥', 'TV Show': '📺', 'Game': '🎮',
    'Music': '🎵', 'Other': '📌'
  }
  return map[media] || ''
}

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) notFound();

  const ratings = await prisma.rating.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { artwork: true }
  });

  const allUsers = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <main className="min-h-screen px-4 py-12 max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-accent hover:underline text-sm">&larr; Back to Leaderboard</Link>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-1 text-foreground">
          {user.name || user.id}
        </h1>
        <div className="flex justify-center gap-6 text-sm text-muted mt-3">
          <span>{user.totalRatings} rating{user.totalRatings !== 1 ? 's' : ''}</span>
          <span>Avg: <span className={getScoreColor(user.averageRating)}>{Math.round(user.averageRating)}</span></span>
          <span>100s: {user.hundredsCount}</span>
        </div>
      </div>

      {/* User tabs */}
      <div className="flex gap-2 mb-10 justify-center flex-wrap">
        {allUsers.map(u => (
          <Link
            key={u.id}
            href={`/user/${u.id}`}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              u.id === user.id
                ? 'bg-accent-dim border-accent text-white'
                : 'bg-surface border-border text-muted hover:text-foreground hover:border-accent/50'
            }`}
          >
            {u.name || u.id}
          </Link>
        ))}
      </div>

      {/* User's ratings */}
      <section>
        <h2 className="text-xl font-bold mb-5">Ratings</h2>
        <div className="space-y-3">
          {ratings.length === 0 && (
            <p className="text-muted text-sm py-8 text-center">No ratings yet.</p>
          )}
          {ratings.map((rating) => (
            <div
              key={rating.id}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-colors"
            >
              <div>
                <span className="font-semibold text-foreground">{rating.artwork.title}</span>
                {rating.artwork.media && (
                  <span className="text-xs text-muted ml-2">{getMediaBadge(rating.artwork.media)} {rating.artwork.media}</span>
                )}
                <div className="text-xs text-muted mt-1">
                  Artwork score: <span className={`font-bold ${getScoreColor(rating.artwork.finalScore)}`}>{rating.artwork.finalScore}</span>
                  <span className="text-muted/50 ml-2">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black tabular-nums ${getScoreColor(rating.rawScore)}`}>
                  {rating.rawScore}
                </span>
                {rating.rawScore !== rating.modifiedScore && (
                  <div className="text-xs text-muted">
                    modified: {Math.round(rating.modifiedScore)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
