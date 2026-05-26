'use client';

import React, { useState } from 'react';
import MathRenderer from '../shared/MathRenderer';
import { toggleForumUpvote } from '@/app/actions/forumActions';

interface ThreadMainPostProps {
  thread: any;
  currentUserId?: string;
}

export default function ThreadMainPost({ thread, currentUserId }: ThreadMainPostProps) {
  const [upvotes, setUpvotes] = useState(thread.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(false);

  const handleUpvote = async () => {
    if (!currentUserId) {
      alert("Log in to upvote this post.");
      return;
    }
    try {
      setIsUpvoted(!isUpvoted);
      setUpvotes((prev: number) => isUpvoted ? prev - 1 : prev + 1);
      await toggleForumUpvote(thread.id, null, thread.author.id);
    } catch (err) {
      setIsUpvoted(!isUpvoted);
      setUpvotes((prev: number) => isUpvoted ? prev + 1 : prev - 1);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1C1F26] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-6">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
            {/* Avatar Placeholder */}
            <span className="font-bold text-slate-500">{thread.author?.full_name?.charAt(0) || 'A'}</span>
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200">
              {thread.author?.full_name || 'Anonymous'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {thread.author?.gamification_rank || 'Novice'}
              </span>
              <span>•</span>
              <span>{new Date(thread.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {/* Difficulty Badge (If applicable) */}
        {thread.difficulty && (
          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
            thread.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
            thread.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {thread.difficulty.toUpperCase()}
          </span>
        )}
      </div>

      {/* Title & Tags */}
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
        {thread.title}
      </h1>
      
      {/* TinyMCE Content */}
      <div 
        className="prose dark:prose-invert max-w-none mb-6"
        dangerouslySetInnerHTML={{ __html: thread.content }}
      />
      
      {/* Initialize KaTeX for any math inside the content */}
      <MathRenderer />
      
      {/* Footer Metrics */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
        <div className="flex gap-4">
          <button 
            onClick={handleUpvote}
            className={`flex items-center gap-1 transition-colors ${
              isUpvoted ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
            }`}
          >
            <svg className="w-5 h-5" fill={isUpvoted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
            <span className="font-semibold">{upvotes} Upvotes</span>
          </button>
          <div className="flex items-center gap-1 text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            <span className="font-semibold">{thread.views} Views</span>
          </div>
        </div>
      </div>
    </div>
  );
}
