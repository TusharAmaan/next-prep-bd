'use client';

import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, Flag } from 'lucide-react';
import { toggleForumUpvote } from '@/app/actions/forumActions';
import MathRenderer from '../shared/MathRenderer';
import ReportModal from './ReportModal';

interface Comment {
  id: string;
  content: string;
  author: any;
  upvotes: number;
  is_expert_reply: boolean;
  created_at: string;
  children?: Comment[];
}

interface CommentSectionProps {
  threadId: string;
  initialComments: Comment[];
  currentUserId?: string;
}

export default function CommentSection({ threadId, initialComments, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        Discussion ({initialComments.length})
      </h2>
      
      {/* Reply Box Placeholder */}
      {currentUserId ? (
        <div className="mb-8 p-4 bg-slate-50 dark:bg-[#1C1F26] rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-505 mb-2 font-medium">Add a reply...</p>
          <div className="h-24 bg-white dark:bg-[#252830] border border-slate-300 dark:border-slate-700 rounded-lg" />
          <div className="mt-3 flex justify-end">
            <button className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
              Post Reply
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 text-center bg-slate-50 dark:bg-[#1C1F26] rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-3">You must be logged in to join the discussion.</p>
          <button className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
            Log In or Sign Up
          </button>
        </div>
      )}

      <div className="space-y-6">
        {comments.map(comment => (
          <CommentThread key={comment.id} comment={comment} threadId={threadId} currentUserId={currentUserId} />
        ))}
      </div>
      
      {/* Ensure MathRenderer handles comments too */}
      <MathRenderer />
    </div>
  );
}

function CommentThread({ comment, threadId, currentUserId, depth = 0 }: { comment: Comment, threadId: string, currentUserId?: string, depth?: number }) {
  const [upvotes, setUpvotes] = useState(comment.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(false); // Ideally this state is seeded from props
  const [showReportModal, setShowReportModal] = useState(false);

  const handleUpvote = async () => {
    if (!currentUserId) {
      alert("Log in to upvote comments.");
      return;
    }
    try {
      // Optimistic UI update
      setIsUpvoted(!isUpvoted);
      setUpvotes(prev => isUpvoted ? prev - 1 : prev + 1);
      
      await toggleForumUpvote(null, comment.id, comment.author.id);
    } catch (err) {
      // Revert on error
      setIsUpvoted(!isUpvoted);
      setUpvotes(prev => isUpvoted ? prev + 1 : prev - 1);
    }
  };

  return (
    <div className={`relative ${depth > 0 ? 'ml-8 pl-4 border-l-2 border-slate-200 dark:border-slate-800' : ''}`}>
      <div className="bg-white dark:bg-[#1C1F26] p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 text-left">
        {/* Comment Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500">
              {comment.author?.full_name?.charAt(0) || 'A'}
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 mr-2">
                {comment.author?.full_name || 'Anonymous'}
              </span>
              {comment.is_expert_reply && (
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  Expert Reply
                </span>
              )}
              <span className="text-xs text-slate-505 ml-2 font-medium">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Comment Body */}
        <div 
          className="prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300 font-medium"
          dangerouslySetInnerHTML={{ __html: comment.content }}
        />

        {/* Comment Actions */}
        <div className="mt-4 flex items-center gap-4 text-xs font-bold text-slate-400">
          <button 
            onClick={handleUpvote}
            className={`flex items-center gap-1 transition-colors ${
              isUpvoted ? 'text-blue-600' : 'hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-blue-600' : ''}`} />
            <span>{upvotes} Kudos</span>
          </button>
          
          <button 
            onClick={() => {
              if (!currentUserId) alert("Log in to reply to comments.");
            }}
            className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          <button 
            onClick={() => {
              if (!currentUserId) {
                alert("Please log in to report comments to moderators.");
                return;
              }
              setShowReportModal(true);
            }}
            className="hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1 transition-colors ml-auto"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Report Modal Component */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        threadId={null}
        commentId={comment.id}
      />

      {/* Render nested children */}
      {comment.children && comment.children.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.children.map(child => (
            <CommentThread key={child.id} comment={child} threadId={threadId} currentUserId={currentUserId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
