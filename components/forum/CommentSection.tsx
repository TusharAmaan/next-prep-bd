'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ThumbsUp, MessageSquare, Flag, Quote as QuoteIcon, Loader2 } from 'lucide-react';
import { toggleForumUpvote, createForumComment } from '@/app/actions/forumActions';
import MathRenderer from '../shared/MathRenderer';
import ReportModal from './ReportModal';
import renderMathInElement from "katex/dist/contrib/auto-render";
import "katex/dist/katex.min.css";
import { capitalizeEachWord } from '@/utils/stringUtils';

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

  const mainReplyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize state with initialComments when props change
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // Re-run KaTeX math auto-render whenever the comments list updates
  useEffect(() => {
    if (commentsContainerRef.current) {
      try {
        renderMathInElement(commentsContainerRef.current, {
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

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (mainReplyTextareaRef.current) {
      adjustHeight(mainReplyTextareaRef.current);
    }
  }, [mainReplyContent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
    }
  };

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
        setErrorMain(capitalizeEachWord('failed to post reply.'));
      }
    } catch (err: any) {
      setErrorMain(err.message || capitalizeEachWord('an error occurred.'));
    } finally {
      setIsSubmittingMain(false);
    }
  };

  // Calculate total comment responses
  const totalComments = comments.reduce((acc, c) => acc + 1 + (c.children?.length || 0), 0);

  return (
    <div className="mt-8" ref={commentsContainerRef}>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-left">
        {capitalizeEachWord('discussion')} ({totalComments})
      </h2>
      
      {/* Reply Box */}
      {currentUserId ? (
        <form onSubmit={handleSubmitMainComment} className="mb-6 p-4 bg-slate-50 dark:bg-[#1C1F26] rounded-2xl border border-slate-200/50 dark:border-slate-800/80 space-y-3">
          <p className="text-slate-700 dark:text-slate-350 text-xs font-bold text-left">
            {capitalizeEachWord('add a reply...')}
          </p>
          <div className="flex gap-3 items-start">
            {/* Current user circular avatar initial */}
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center font-black text-xs shrink-0 shadow-sm border border-indigo-100 dark:border-indigo-800">
              {currentUserProfile?.full_name?.charAt(0).toUpperCase() || 'Y'}
            </div>
            <div className="flex-1">
              <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#252830] focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all duration-300">
                <textarea
                  ref={mainReplyTextareaRef}
                  value={mainReplyContent}
                  onChange={(e) => setMainReplyContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={capitalizeEachWord('type your comment here...')}
                  rows={1}
                  className="w-full px-4 py-3 text-sm bg-transparent border-none outline-none resize-none focus:ring-0 text-slate-800 dark:text-slate-100 font-semibold transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
          {errorMain && (
            <p className="text-rose-500 text-xs font-bold flex items-center gap-1 text-left pl-11">
              <span>{errorMain}</span>
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingMain || !mainReplyContent.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-350 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-xs flex items-center gap-1.5"
            >
              {isSubmittingMain && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{capitalizeEachWord('post reply')}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-6 text-center bg-slate-50 dark:bg-[#1C1F26] rounded-xl border border-slate-200/55 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400 font-medium mb-3">
            {capitalizeEachWord('you must be logged in to join the discussion.')}
          </p>
          <Link 
            href="/login" 
            className="inline-block px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            {capitalizeEachWord('log in or sign up')}
          </Link>
        </div>
      )}

      <div className="space-y-4">
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
            adjustHeight={adjustHeight}
            handleKeyDown={handleKeyDown}
          />
        ))}
      </div>
      
      {/* Fallback MathRenderer just in case */}
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
  onAddReply,
  adjustHeight,
  handleKeyDown
}: { 
  comment: Comment; 
  threadId: string; 
  currentUserId?: string; 
  depth?: number;
  initialIsUpvoted: boolean;
  userCommentUpvotes: string[];
  currentUserProfile: any;
  onAddReply: (comment: Comment) => void;
  adjustHeight: (el: HTMLTextAreaElement | null) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  const [upvotes, setUpvotes] = useState(comment.upvotes);
  const [isUpvoted, setIsUpvoted] = useState(initialIsUpvoted);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [errorReply, setErrorReply] = useState('');

  const threadReplyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync state if initial value changes
  useEffect(() => {
    setIsUpvoted(initialIsUpvoted);
  }, [initialIsUpvoted]);

  useEffect(() => {
    setUpvotes(comment.upvotes);
  }, [comment.upvotes]);

  // Adjust height of inline thread reply textarea
  useEffect(() => {
    if (threadReplyTextareaRef.current) {
      adjustHeight(threadReplyTextareaRef.current);
    }
  }, [replyContent]);

  const handleUpvote = async () => {
    if (!currentUserId) {
      alert(capitalizeEachWord("log in to upvote comments."));
      return;
    }
    try {
      setIsUpvoted(!isUpvoted);
      setUpvotes(prev => isUpvoted ? prev - 1 : prev + 1);
      await toggleForumUpvote(null, comment.id, comment.author.id);
    } catch (err) {
      setIsUpvoted(!isUpvoted);
      setUpvotes(prev => isUpvoted ? prev + 1 : prev - 1);
    }
  };

  const handleQuote = () => {
    if (!currentUserId) {
      alert(capitalizeEachWord("log in to reply or quote comments."));
      return;
    }
    setShowReplyForm(true);
    // Strip HTML tags for clean quote
    const cleanContent = comment.content.replace(/<[^>]+>/g, '').trim();
    const quoteMarkup = `<blockquote><strong>${capitalizeEachWord(comment.author?.full_name || 'anonymous')} wrote:</strong><br/>${cleanContent}</blockquote>\n`;
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
        setErrorReply(capitalizeEachWord('failed to post reply.'));
      }
    } catch (err: any) {
      setErrorReply(err.message || capitalizeEachWord('an error occurred.'));
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getInitial = (nameStr: string) => {
    return (nameStr || 'A').charAt(0).toUpperCase();
  };

  return (
    <div className={`relative text-left ${depth > 0 ? 'ml-6 pl-4 border-l-2 border-slate-200 dark:border-slate-800' : ''}`}>
      <div className="flex gap-2.5 items-start py-1">
        {/* Circular Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-slate-400 text-[10px] shrink-0">
          {getInitial(comment.author?.full_name)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Facebook Style unified comment bubble */}
          <div className="flex flex-col items-start">
            <div className="inline-block bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-800/40 rounded-2xl p-2.5 px-4 max-w-[90%] text-left">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs hover:underline cursor-pointer">
                  {capitalizeEachWord(comment.author?.full_name || 'anonymous')}
                </span>
                {comment.is_expert_reply && (
                  <span className="bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-[8px] px-1.5 py-0.2 rounded font-black uppercase">
                    {capitalizeEachWord('expert reply')}
                  </span>
                )}
              </div>
              <div className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">
                {capitalizeEachWord(comment.author?.gamification_rank || 'novice')} • {new Date(comment.created_at).toLocaleDateString()}
              </div>
              <div 
                className="prose dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-200 text-[13px] leading-relaxed font-normal whitespace-pre-line break-words"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
            </div>
          </div>

          {/* Minimal Dot-Separated Link Actions */}
          <div className="flex items-center gap-2 px-3 mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
            <button 
              onClick={handleUpvote}
              className={`hover:text-blue-600 transition-colors ${isUpvoted ? 'text-blue-600' : ''}`}
            >
              {upvotes} {capitalizeEachWord(upvotes === 1 ? 'kudo' : 'kudos')}
            </button>
            <span>•</span>
            <button 
              onClick={() => {
                if (!currentUserId) {
                  alert(capitalizeEachWord("log in to reply to comments."));
                  return;
                }
                setShowReplyForm(!showReplyForm);
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {capitalizeEachWord('reply')}
            </button>
            <span>•</span>
            <button 
              onClick={handleQuote}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {capitalizeEachWord('quote')}
            </button>
            <span>•</span>
            <button 
              onClick={() => {
                if (!currentUserId) {
                  alert(capitalizeEachWord("please log in to report comments to moderators."));
                  return;
                }
                setShowReportModal(true);
              }}
              className="hover:text-rose-500 dark:hover:text-rose-450 transition-colors ml-auto font-bold text-[10px]"
            >
              {capitalizeEachWord('report')}
            </button>
          </div>

          {/* Inline nested Reply Form */}
          {showReplyForm && (
            <form onSubmit={handleSubmitReply} className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/50 dark:border-slate-800/80 space-y-2.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-black text-slate-500 uppercase tracking-wider">
                  {capitalizeEachWord(`reply to ${comment.author?.full_name || 'comment'}`)}
                </span>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                  className="font-bold text-rose-500 hover:underline"
                >
                  {capitalizeEachWord('cancel')}
                </button>
              </div>
              <div className="flex gap-2 items-start">
                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-[9px] text-slate-400 shrink-0">
                  {currentUserProfile?.full_name?.charAt(0).toUpperCase() || 'Y'}
                </div>
                <div className="flex-1">
                  <div className="bg-white dark:bg-[#1C1F26] border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 px-3 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                    <textarea
                      ref={threadReplyTextareaRef}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={capitalizeEachWord('type your reply...')}
                      rows={1}
                      className="w-full bg-transparent outline-none resize-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-xs py-1 transition-all"
                    />
                  </div>
                </div>
              </div>
              {errorReply && (
                <p className="text-rose-500 text-[10px] font-bold text-left pl-9">
                  {errorReply}
                </p>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReply || !replyContent.trim()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 text-white font-bold rounded-lg text-xs shadow-sm flex items-center gap-1"
                >
                  {isSubmittingReply && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{capitalizeEachWord('post reply')}</span>
                </button>
              </div>
            </form>
          )}
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
        <div className="mt-2.5 space-y-2.5">
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
              adjustHeight={adjustHeight}
              handleKeyDown={handleKeyDown}
            />
          ))}
        </div>
      )}
    </div>
  );
}
