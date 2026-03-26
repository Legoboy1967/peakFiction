import { prisma } from '@/lib/prisma'
import RatingForm from './components/RatingForm'
import Link from 'next/link'

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-score-high'
  if (score >= 50) return 'text-score-mid'
  return 'text-score-low'
}

function getRankBadge(idx: number): string {
  if (idx === 0) return '🥇'
  if (idx === 1) return '🥈'
  if (idx === 2) return '🥉'
  return `#${idx + 1}`
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

export default async function Home() {
  const artworks = await prisma.artwork.findMany({
    orderBy: { finalScore: 'desc' },
    include: { ratings: { include: { user: true } } }
  });

  const recentRatings = await prisma.rating.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true, artwork: true },
    take: 20
  });

  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });

  const leaderBoard = artworks.filter(a => a.ratingCount >= 2);
  const waitingList = artworks.filter(a => a.ratingCount === 1);

  return (
    <main className="min-h-screen px-4 py-12 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-black tracking-tight mb-2">
          <span className="text-accent">Peak</span>{' '}
          <span className="text-foreground">Fiction</span>
        </h1>
        <p className="text-muted text-sm tracking-wide uppercase">
          Rate the greatest works of art
        </p>
      </div>

      {/* User tabs */}
      {users.length > 0 && (
        <div className="flex gap-2 mb-10 justify-center flex-wrap">
          {users.map(user => (
            <Link
              key={user.id}
              href={`/user/${user.id}`}
              className="px-4 py-2 rounded-lg bg-surface border border-border text-sm font-medium text-muted hover:text-foreground hover:border-accent/50 transition-colors"
            >
              {user.name || user.id}
              <span className="text-xs text-muted/50 ml-1">({user.totalRatings})</span>
            </Link>
          ))}
        </div>
      )}

      {/* Rating Form */}
      <section className="mb-14 bg-surface border border-border rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6 text-foreground">Submit a Rating</h2>
        <RatingForm />
      </section>

      {/* Leaderboard + Waiting List */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-14">
        <section className="lg:col-span-3">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <span className="text-gold">&#9733;</span> Leaderboard
          </h2>
          <div className="space-y-3">
            {leaderBoard.length === 0 && (
              <p className="text-muted text-sm py-8 text-center">
                No artworks ranked yet. Be the first to rate!
              </p>
            )}
            {leaderBoard.map((artwork, idx) => (
              <div
                key={artwork.id}
                className={`flex items-center justify-between p-4 rounded-xl border border-border bg-surface hover:bg-surface-hover transition-colors ${
                  idx === 0 ? 'glow-card border-accent/30' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-bold min-w-[2.5rem] text-center ${
                    idx === 0 ? 'text-gold' : idx === 1 ? 'text-silver' : idx === 2 ? 'text-bronze' : 'text-muted'
                  }`}>
                    {getRankBadge(idx)}
                  </span>
                  <div>
                    <span className="font-semibold text-foreground">{artwork.title}</span>
                    {artwork.media && (
                      <span className="text-xs text-muted ml-2">{getMediaBadge(artwork.media)} {artwork.media}</span>
                    )}
                    <div className="text-muted text-xs">
                      {artwork.ratingCount} rating{artwork.ratingCount !== 1 ? 's' : ''}
                      <span className="text-muted/50 ml-1">
                        by {artwork.ratings.map(r => r.user.name || r.userId).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-2xl font-black tabular-nums ${getScoreColor(artwork.finalScore)}`}>
                  {artwork.finalScore}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
            <span className="text-muted">&#8987;</span> Waiting List
          </h2>
          <div className="space-y-3">
            {waitingList.length === 0 && (
              <p className="text-muted text-sm py-8 text-center">
                No artworks waiting. Submit a new one!
              </p>
            )}
            {waitingList.map((artwork) => (
              <div
                key={artwork.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-surface/50"
              >
                <div>
                  <span className="font-medium text-muted">{artwork.title}</span>
                  {artwork.media && (
                    <span className="text-xs text-muted/50 ml-2">{getMediaBadge(artwork.media)} {artwork.media}</span>
                  )}
                </div>
                <span className={`text-lg font-bold tabular-nums ${getScoreColor(artwork.finalScore)}`}>
                  {artwork.finalScore}
                </span>
              </div>
            ))}
          </div>
          <p className="text-muted/60 text-xs mt-4 text-center">
            Needs 2+ ratings to reach the leaderboard
          </p>
        </section>
      </div>

      {/* Recent Ratings Feed */}
      <section>
        <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
          <span className="text-accent">&#9889;</span> Recent Ratings
        </h2>
        <div className="space-y-2">
          {recentRatings.length === 0 && (
            <p className="text-muted text-sm py-8 text-center">No ratings yet.</p>
          )}
          {recentRatings.map((rating) => (
            <div
              key={rating.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-surface/30"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-accent min-w-[5rem]">
                  {rating.user.name || rating.userId}
                </span>
                <span className="text-sm text-foreground">
                  rated <span className="font-medium">{rating.artwork.title}</span>
                </span>
                {rating.artwork.media && (
                  <span className="text-xs text-muted">{getMediaBadge(rating.artwork.media)}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-lg font-black tabular-nums ${getScoreColor(rating.rawScore)}`}>
                  {rating.rawScore}
                </span>
                <span className="text-xs text-muted">
                  {new Date(rating.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
