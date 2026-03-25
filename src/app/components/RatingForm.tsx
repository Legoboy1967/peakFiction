'use client'

import { useState } from 'react'
import { submitRating } from '../actions'

export default function RatingForm() {
  const [title, setTitle] = useState('');
  const [score, setScore] = useState(60);
  const [userId, setUserId] = useState('William'); // Default user
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await submitRating(title, score, userId);
      setTitle('');
      setScore(60);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (to track average)</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-2 border rounded border-gray-300 focus:ring-primary focus:border-primary"
            placeholder="e.g. William"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Artwork Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded border-gray-300 focus:ring-primary focus:border-primary"
            placeholder="e.g. Lord of the Mysteries"
            required
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Rating (1-100)</label>
          <span className="font-bold text-primary">{score}</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
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
        className={`w-full py-3 px-4 rounded font-bold text-white transition-colors ${
          isSubmitting ? 'bg-gray-400' : 'bg-primary hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
      </button>

      {error && (
        <p className="mt-2 text-red-500 text-sm font-medium">{error}</p>
      )}
    </form>
  );
}
