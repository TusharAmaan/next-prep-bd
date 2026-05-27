'use client';

import React, { useState, useEffect } from 'react';
import { ThumbsUp, Eye, Flag, Bookmark } from 'lucide-react';
import MathRenderer from '../shared/MathRenderer';
import { toggleForumUpvote, toggleForumBookmark } from '@/app/actions/forumActions';
import ReportModal from './ReportModal';
import MCQInteractiveWrapper from './MCQInteractiveWrapper';

interface ThreadMainPostProps {
  thread: any;
  currentUserId?: string;
  initialIsUpvoted?: boolean;
  initialIsBookmarked?: boolean;
  hasAnswered?: boolean;
  previouslySelectedOptionId?: string;
  metrics?: { [key: string]: number };
}

export default function ThreadMainPost({ 
  thread, 
  currentUserId, 
  initialIsUpvoted = false,
  initialIsBookmarked = false,
  hasAnswered = false,
  previouslySelectedOptionId,
  metrics
}: ThreadMainPostProps) {
  const [upvotes, setUpvotes] = useState(thread.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(initialIsUpvoted);
  const [isSaved, setIsSaved] = useState(initialIsBookmarked);
  const [hasAnsweredState, setHasAnsweredState] = useState(hasAnswered);
  const [selectedOptionState, setSelectedOptionState] = useState(previouslySelectedOptionId);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    setIsSaved(initialIsBookmarked);
  }, [initialIsBookmarked]);

  useEffect(() => {
    setHasAnsweredState(hasAnswered);
    setSelectedOptionState(previouslySelectedOptionId);
  }, [hasAnswered, previouslySelectedOptionId]);

  useEffect(() => {
    setIsUpvoted(initialIsUpvoted);
  }, [initialIsUpvoted]);

  useEffect(() => {
    setUpvotes(thread.upvotes);
  }, [thread.upvotes]);

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

  const handleSave = async () => {
    if (!currentUserId) {
      alert("Please log in to save this post.");
      return;
    }
    try {
      setIsSaved(!isSaved);
      await toggleForumBookmark(thread.id);
    } catch (err: any) {
      setIsSaved(!isSaved);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1C1F26] rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-left">
      
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight leading-tight">
        {thread.title}
      </h1>
      
      {/* Tags Banner */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-slate-400 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        {thread.difficulty && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
            thread.difficulty === 'hard' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' :
            thread.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20' :
            'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
          }`}>
            {thread.difficulty}
          </span>
        )}
        {thread.segment && <span>{thread.segment.title}</span>}
        {thread.group && <span>• {thread.group.title}</span>}
        {thread.subject && <span>• {thread.subject.title}</span>}
      </div>

      {/* Author & Kudos Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/25 p-4 rounded-2xl border border-slate-150/40 dark:border-slate-850/40 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center font-black text-blue-600 dark:text-blue-400 text-sm shadow-sm">
            {thread.author?.full_name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 leading-snug">
              {thread.author?.full_name || 'Community Member'}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">
              <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-extrabold text-[9px]">
                {thread.author?.gamification_rank || 'Novice'}
              </span>
              <span>•</span>
              <span>{new Date(thread.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2.5 self-start sm:self-center">
          {/* Kudos Action */}
          <button 
            onClick={handleUpvote}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-black transition-all active:scale-95 shadow-sm ${
              isUpvoted 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-white hover:bg-slate-50 dark:bg-[#1C1F26] dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:text-blue-600 hover:border-blue-600/30'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-white' : ''}`} />
            <span>{upvotes} Kudos</span>
          </button>

          {/* Save Action */}
          <button 
            onClick={handleSave}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-black transition-all active:scale-95 shadow-sm ${
              isSaved 
                ? 'bg-indigo-600 border-indigo-600 text-white' 
                : 'bg-white hover:bg-slate-50 dark:bg-[#1C1F26] dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-350 hover:text-indigo-600 hover:border-indigo-600/30'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* MCQ option boxes placed at the red box */}
      {thread.thread_type === 'question_post' && thread.questions && thread.questions.length > 0 && (
        <div className="mb-6 animate-in fade-in duration-300">
          {thread.questions.map((tq: any) => (
            <MCQInteractiveWrapper 
              key={tq.question.id}
              threadId={thread.id}
              options={tq.question.options || []}
              hasAnswered={hasAnsweredState}
              previouslySelectedOptionId={selectedOptionState}
              metrics={metrics}
              isLoggedIn={!!currentUserId}
              onAnswered={(optionId: string) => {
                setHasAnsweredState(true);
                setSelectedOptionState(optionId);
              }}
            />
          ))}
        </div>
      )}

      {/* TinyMCE Content */}
      <div 
        className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-250 text-base leading-relaxed mb-6 font-medium"
        dangerouslySetInnerHTML={{ __html: thread.content }}
      />
      
      {/* Initialize KaTeX */}
      <MathRenderer />
      
      {/* Footer Details */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5" /> {thread.views} Views
        </span>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (!currentUserId) {
                alert("Please log in to report posts to moderators.");
                return;
              }
              setShowReportModal(true);
            }}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
          <button 
            onClick={handleUpvote}
            className={`text-xs font-black transition-colors ${
              isUpvoted ? 'text-blue-600 hover:text-blue-700' : 'text-slate-400 hover:text-blue-600'
            }`}
          >
            {isUpvoted ? 'Remove Kudos' : 'Give Kudos'}
          </button>
        </div>
      </div>

      {/* Report Modal Component */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        threadId={thread.id}
        commentId={null}
      />
    </div>
  );
}
