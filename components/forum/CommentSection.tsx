'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThumbsUp, MessageSquare, Flag, Quote as QuoteIcon, Loader2 } from 'lucide-react';
import { toggleForumUpvote, createForumComment } from '@/app/actions/forumActions';
import MathRenderer from '../shared/MathRenderer';
import ReportModal from './ReportModal';

interface Comment {
  id: string;
  content: string;
  author: any;
  upvotes: number;
  is_expert_reply: boolean;
  created_at: string;
  parent_id?: string | null;
  children?: Comment[];
}

interface CommentSectionProps {
  threadId: string;
  initialComments: Comment[];
  currentUserId?: string;
  userCommentUpvotes?: string[];
  currentUserProfile?: any;
}

export default function CommentSection({ 
  threadId, 
  initialComments, 
  currentUserId,
  userCommentUpvotes = [],
  currentUserProfile
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [mainReplyContent, setMainReplyContent] = useState('');
  const [isSubmittingMain, setIsSubmittingMain] = useState(false);
  const [errorMain, setErrorMain] = useState('');

  // Synchronize state with initialComments when props change
  React.useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // Re-run KaTeX math auto-render whenever the comments list updates
  React.useEffect(() => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.renderMathInElement) {
      try {
        // @ts-ignore
        window.renderMathInElement(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
          ],
          throwOnError: false
        });
      } catch (err) {
        console.error("KaTeX comments render error:", err);
      }
    }
  }, [comments]);

  // Recursively append reply to comments list
  const handleAddCommentLocally = (newComment: Comment) => {
    if (!newComment.parent_id) {
      setComments(prev => [...prev, { ...newComment, children: [] }]);
    } else {
      const appendChild = (list: Comment[]): Comment[] => {
        return list.map(c => {
          if (c.id === newComment.parent_id) {
            return {
              ...c,
              children: [...(c.children || []), { ...newComment, children: [] }]
            };
          }
          if (c.children && c.children.length > 0) {
            return {
              ...c,
              children: appendChild(c.children)
            };
          }
          return c;
        });
      };
      setComments(prev => appendChild(prev));
    }
  };

  const handleSubmitMainComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainReplyContent.trim()) return;

    setIsSubmittingMain(true);
    setErrorMain('');

    try {
      const res = await createForumComment(threadId, mainReplyContent, null);
      if (res.success && res.comment) {
        const newCommentObj: Comment = {
          id: res.comment.id,
          content: res.comment.content,
          author: currentUserProfile || { id: currentUserId, full_name: 'You', gamification_rank: 'Novice' },
          upvotes: 0,
          is_expert_reply: res.comment.is_expert_reply,
          created_at: res.comment.created_at,
          children: []
        };
        handleAddCommentLocally(newCommentObj);
        setMainReplyContent('');
      } else {
        setErrorMain('Failed to post reply.');
      }
    } catch (err: any) {
      setErrorMain(err.message || 'An error occurred.');
    } finally {
      setIsSubmittingMain(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        Discussion ({comments.reduce((acc, c) => acc + 1 + (c.children?.length || 0), 0)})
      </h2>
      
      {/* Reply Box */}
      {currentUserId ? (
        <form onSubmit={handleSubmitMainComment} className="mb-8 p-5 bg-slate-50 dark:bg-[#1C1F26] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <p className="text-slate-700 dark:text-slate-350 text-sm font-bold">Add a reply...</p>
          <textarea
            value={mainReplyContent}
            onChange={(e) => setMainReplyContent(e.target.value)}
            placeholder="Type your comment here..."
            rows={4}
            className="w-full px-4 py-3 text-sm bg-white dark:bg-[#252830] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-850 dark:text-slate-100 font-semibold transition-all resize-none shadow-sm"
          />
          {errorMain && (
            <p className="text-rose-500 text-xs font-bold flex items-center gap-1">
              <span>{errorMain}</span>
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingMain || !mainReplyContent.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-750 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-sm flex items-center gap-1.5"
            >
              {isSubmittingMain && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Post Reply</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 text-center bg-slate-50 dark:bg-[#1C1F26] rounded-xl border border-slate-200 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-3">You must be logged in to join the discussion.</p>
          <Link 
            href="/login" 
            className="inline-block px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In or Sign Up
          </Link>
        </div>
      )}

      <div className="space-y-6">
        {comments.map(comment => (
          <CommentThread 
            key={comment.id} 
            comment={comment} 
            threadId={threadId} 
            currentUserId={currentUserId} 
            initialIsUpvoted={userCommentUpvotes.includes(comment.id)}
            userCommentUpvotes={userCommentUpvotes}
            currentUserProfile={currentUserProfile}
            onAddReply={handleAddCommentLocally}
          />
        ))}
      </div>
      
      {/* Ensure MathRenderer handles comments too */}
      <MathRenderer />
    </div>
  );
}

function CommentThread({ 
  comment, 
  threadId, 
  currentUserId, 
  depth = 0,
  initialIsUpvoted,
  userCommentUpvotes,
  currentUserProfile,
  onAddReply
}: { 
  comment: Comment; 
  threadId: string; 
  currentUserId?: string; 
  depth?: number;
  initialIsUpvoted: boolean;
  userCommentUpvotes: string[];
  currentUserProfile: any;
  onAddReply: (comment: Comment) => void;
}) {
  const [upvotes, setUpvotes] = useState(comment.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(initialIsUpvoted);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [errorReply, setErrorReply] = useState('');

  // Sync state if initial value changes
  React.useEffect(() => {
    setIsUpvoted(initialIsUpvoted);
  }, [initialIsUpvoted]);

  React.useEffect(() => {
    setUpvotes(comment.upvotes);
  }, [comment.upvotes]);

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

  const handleQuote = () => {
    if (!currentUserId) {
      alert("Log in to reply or quote comments.");
      return;
    }
    setShowReplyForm(true);
    // Strip HTML tags for clean quote
    const cleanContent = comment.content.replace(/<[^>]+>/g, '').trim();
    const quoteMarkup = `<blockquote><strong>${comment.author?.full_name || 'Anonymous'} wrote:</strong><br/>${cleanContent}</blockquote>\n`;
    setReplyContent(prev => quoteMarkup + prev);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmittingReply(true);
    setErrorReply('');

    try {
      const res = await createForumComment(threadId, replyContent, comment.id);
      if (res.success && res.comment) {
        const newCommentObj: Comment = {
          id: res.comment.id,
          content: res.comment.content,
          author: currentUserProfile || { id: currentUserId, full_name: 'You', gamification_rank: 'Novice' },
          upvotes: 0,
          is_expert_reply: res.comment.is_expert_reply,
          created_at: res.comment.created_at,
          children: []
        };
        onAddReply(newCommentObj);
        setReplyContent('');
        setShowReplyForm(false);
      } else {
        setErrorReply('Failed to post reply.');
      }
    } catch (err: any) {
      setErrorReply(err.message || 'An error occurred.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className={`relative ${depth > 0 ? 'ml-6 pl-4 border-l-2 border-slate-200 dark:border-slate-800' : ''}`}>
      <div className="bg-white dark:bg-[#1C1F26] p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-left space-y-3.5">
        {/* Comment Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-black text-slate-500">
              {comment.author?.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="text-left">
              <span className="font-extrabold text-slate-850 dark:text-slate-200 text-sm mr-2">
                {comment.author?.full_name || 'Anonymous'}
              </span>
              {comment.is_expert_reply && (
                <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-[10px] px-2 py-0.5 rounded font-black uppercase">
                  Expert Reply
                </span>
              )}
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                {comment.author?.gamification_rank || 'Novice'} • {new Date(comment.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Comment Body */}
        <div 
          className="prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-350 font-medium leading-relaxed"
          dangerouslySetInnerHTML={{ __html: comment.content }}
        />

        {/* Comment Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-4 text-xs font-black text-slate-400">
          <button 
            onClick={handleUpvote}
            className={`flex items-center gap-1 transition-colors ${
              isUpvoted ? 'text-blue-600' : 'hover:text-slate-655 dark:hover:text-slate-200'
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-blue-600 text-blue-600' : ''}`} />
            <span>{upvotes} Kudos</span>
          </button>
          
          <button 
            onClick={() => {
              if (!currentUserId) {
                alert("Log in to reply to comments.");
                return;
              }
              setShowReplyForm(!showReplyForm);
            }}
            className="hover:text-slate-655 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          <button 
            onClick={handleQuote}
            className="hover:text-slate-655 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <QuoteIcon className="w-3.5 h-3.5" />
            <span>Quote</span>
          </button>

          <button 
            onClick={() => {
              if (!currentUserId) {
                alert("Please log in to report comments to moderators.");
                return;
              }
              setShowReportModal(true);
            }}
            className="hover:text-rose-500 dark:hover:text-rose-400 flex items-center gap-1 transition-colors ml-auto font-bold text-[11px]"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>

        {/* Inline nested Reply Form */}
        {showReplyForm && (
          <form onSubmit={handleSubmitReply} className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Reply to {comment.author?.full_name || 'Comment'}</span>
              <button 
                type="button" 
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
                className="text-[10px] font-bold text-rose-500 hover:underline"
              >
                Cancel
              </button>
            </div>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Type your reply..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-[#1C1F26] border border-slate-250 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-slate-850 dark:text-slate-250 font-semibold transition-all resize-none shadow-sm"
            />
            {errorReply && (
              <p className="text-rose-500 text-[11px] font-bold">
                {errorReply}
              </p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingReply || !replyContent.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1"
              >
                {isSubmittingReply && <Loader2 className="w-3 h-3 animate-spin" />}
                <span>Post Reply</span>
              </button>
            </div>
          </form>
        )}
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
            <CommentThread 
              key={child.id} 
              comment={child} 
              threadId={threadId} 
              currentUserId={currentUserId} 
              depth={depth + 1}
              initialIsUpvoted={userCommentUpvotes.includes(child.id)}
              userCommentUpvotes={userCommentUpvotes}
              currentUserProfile={currentUserProfile}
              onAddReply={onAddReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
