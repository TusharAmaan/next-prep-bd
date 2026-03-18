'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import Link from 'next/link';

interface VotingSectionProps {
  newsId: number | string;
  userId?: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
}

export default function VotingSection({
  newsId,
  userId,
  initialUpvotes = 0,
  initialDownvotes = 0,
}: VotingSectionProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchVotes();
    }
  }, [userId]);

  const fetchVotes = async () => {
    try {
      const response = await fetch(
        `/api/news/vote?newsId=${newsId}&userId=${userId}`
      );
      const data = await response.json();
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      setUserVote(data.userVote);
    } catch (error) {
      console.error('Failed to fetch votes:', error);
    }
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!userId) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/news/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsId, voteType, userId }),
      });

      const data = await response.json();
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
      setUserVote(data.userVote);
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Did you find this article helpful?
          </p>
          <p className="text-xs text-gray-600">
            Log in to vote and help others discover valuable content.
          </p>
        </div>
        <Link
          href="/login?redirect=/news"
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition whitespace-nowrap"
        >
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
      <span className="text-sm font-semibold text-gray-600">
        Was this helpful?
      </span>

      <button
        onClick={() => handleVote('upvote')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
          userVote === 'upvote'
            ? 'bg-green-500 text-white shadow-lg'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-400'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ThumbsUp className="w-5 h-5" />
        <span>{upvotes}</span>
      </button>

      <button
        onClick={() => handleVote('downvote')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
          userVote === 'downvote'
            ? 'bg-red-500 text-white shadow-lg'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-400'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ThumbsDown className="w-5 h-5" />
        <span>{downvotes}</span>
      </button>
    </div>
  );
}
