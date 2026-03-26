'use client'

import { useState } from 'react'
import { submitRating } from '../actions'

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Masterpiece'
  if (score >= 75) return 'Excellent'
  if (score >= 60) return 'Great'
  if (score >= 45) return 'Decent'
  if (score >= 30) return 'Mediocre'
  return 'Bad'
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return 'text-score-high'
  if (score >= 50) return 'text-score-mid'
  return 'text-score-low'
}

const MEDIA_TYPES = ['Anime', 'Manga', 'Novel', 'Manhwa', 'Manhua', 'Movie', 'TV Show', 'Game', 'Music', 'Other'] as const;

export default function RatingForm() {
  const [title, setTitle] = useState('');
  const [media, setMedia] = useState('');
  const [score, setScore] = useState(60);
  const [userId, setUserId] = useState('William');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await submitRating(title, score, userId, media || undefined);
      setTitle('');
      setMedia('');
      setScore(60);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Your Name</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-3 bg-background border border-border rounded-lg text-foreground placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors"
            placeholder="e.g. William"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Artwork Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 bg-background border border-border rounded-lg text-foreground placeholder-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors"
            placeholder="e.g. Lord of the Mysteries"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-muted mb-2">Media</label>
          <select
            value={media}
            onChange={(e) => setMedia(e.target.value)}
            className="w-full p-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 transition-colors"
          >
            <option value="">Select type...</option>
            {MEDIA_TYPES.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-3">
          <label className="block text-sm font-medium text-muted">Rating</label>
          <div className="text-right">
            <span className={`text-3xl font-black tabular-nums ${getScoreTextColor(score)}`}>
              {score}
            </span>
            <span className="text-muted text-xs block">{getScoreLabel(score)}</span>
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted/50 mt-1">
          <span>1</span>
          <span>25</span>
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 px-4 rounded-lg font-bold text-sm tracking-wide uppercase transition-all ${
          isSubmitting
            ? 'bg-border text-muted cursor-not-allowed'
            : 'bg-accent-dim hover:bg-accent text-white hover:shadow-lg hover:shadow-accent/20'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
      </button>

      {success && (
        <p className="text-score-high text-sm font-medium text-center animate-pulse">
          Rating submitted successfully!
        </p>
      )}

      {error && (
        <p className="text-score-low text-sm font-medium text-center">{error}</p>
      )}
    </form>
  );
}
