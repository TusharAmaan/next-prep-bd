"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MessageSquare, Trash2, Send, CornerDownRight, Loader2, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from './ConfirmModal';
import RichTextDisplay from './RichTextDisplay';
import { capitalizeEachWord } from '@/utils/stringUtils';

interface DiscussionProps {
  itemType: string;
  itemId: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: { id: string; full_name: string } | null;
}

function normalizeComment(raw: any): Comment {
  let profiles = raw.profiles;
  if (Array.isArray(profiles)) profiles = profiles[0] || null;
  return { ...raw, profiles };
}

export default function Discussion({ itemType, itemId }: DiscussionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [session, setSession] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const mainTextareaRef = useRef<HTMLTextAreaElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id, content, created_at, user_id, parent_id,
          profiles:user_id(id, full_name)
        `)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments((data || []).map(normalizeComment));
    } catch (error: any) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) fetchComments();
  }, [itemId]);

  // Math rendering is now handled by RichTextDisplay

  const adjustHeight = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  // Adjust height of main comment text area
  useEffect(() => {
    if (mainTextareaRef.current) {
      adjustHeight(mainTextareaRef.current);
    }
  }, [newComment]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      // Prevent triggering form submits or default click actions, let newline behave normally
      e.stopPropagation();
    }
  };

  const handleSubmit = async (parentId: string | null = null, content: string) => {
    if (!session) { toast.error('You must be logged in to comment'); return; }
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ item_type: itemType, item_id: itemId, content: content.trim(), parent_id: parentId, user_id: session.user.id }])
        .select(`id, content, created_at, user_id, parent_id, profiles:user_id(id, full_name)`)
        .single();

      if (error) throw error;
      toast.success('Comment posted');
      setNewComment(""); setReplyContent(""); setReplyingTo(null);
      setComments(prev => [...prev, normalizeComment(data)]);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error(error.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);
  const sortedRoots = [...rootComments].sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? db - da : da - db;
  });

  const timeAgo = (dateStr: string) => {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getInitial = (comment: Comment | any) => {
    const name = comment.profiles?.full_name || comment.profiles?.[0]?.full_name || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getName = (comment: Comment | any) => {
    return comment.profiles?.full_name || comment.profiles?.[0]?.full_name || 'Anonymous';
  };

  return (
    <div className="w-full" ref={commentsContainerRef}>
      {/* --- MINIMAL HEADER --- */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/60 rounded-lg">
          <span className="text-xs font-semibold text-indigo-650 dark:text-indigo-400">
            {rootComments.length} {rootComments.length === 1 ? 'comment' : 'comments'}
          </span>
        </div>
        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/40" />
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
          <span>Sort by</span>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="bg-transparent border-none outline-none cursor-pointer text-slate-600 dark:text-slate-450 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-semibold"
          >
            <option value="newest" className="dark:bg-slate-900">Newest</option>
            <option value="oldest" className="dark:bg-slate-900">Oldest</option>
          </select>
        </div>
      </div>

      {/* --- SLEEK INPUT AREA --- */}
      {session ? (
        <div className="mb-6">
          <div className="flex gap-3">
            {/* Circular Avatar */}
            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-indigo-100 dark:border-indigo-800">
              {session.user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 space-y-2">
              <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-within:border-indigo-500 transition-all duration-300">
                <textarea
                  ref={mainTextareaRef}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Write a comment as ${session.user.email?.split('@')[0] || 'user'}...`}
                  rows={1}
                  className="w-full bg-transparent outline-none resize-none text-sm p-3.5 pb-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 placeholder:font-normal leading-relaxed transition-all"
                />
                
                <div className={`flex justify-end p-3 pt-0 transition-all duration-300 transform ${newComment.trim() ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 h-0 overflow-hidden'}`}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewComment("")}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-850 dark:hover:text-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSubmit(null, newComment)}
                      disabled={submitting || !newComment.trim()}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group mb-8">
          <div className="relative p-6 md:p-8 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-center overflow-hidden shadow-sm">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 tracking-tight">
              Join the conversation
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mb-4 max-w-sm mx-auto leading-relaxed">
              Sign in to share your thoughts, ask questions, or discuss this article with others.
            </p>
            
            <a 
              href="/login" 
              className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:scale-[1.02] active:scale-95"
            >
              Sign in to reply
            </a>
          </div>
        </div>
      )}

      {/* --- COMMENTS LIST --- */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 opacity-50">
            <div className="w-6 h-6 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Loading comments...</span>
          </div>
        ) : sortedRoots.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center group">
            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900/60 flex items-center justify-center mb-3 border border-slate-100 dark:border-slate-800">
              <MessageSquare className="w-5 h-5 text-slate-300 dark:text-slate-700" />
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
              No comments yet. <br/> 
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRoots.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={getReplies(comment.id)}
                session={session}
                replyingTo={replyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                onReply={(id: string | null) => { setReplyingTo(id); setReplyContent(""); }}
                onSubmitReply={(parentId: string, content: string) => handleSubmit(parentId, content)}
                onDelete={(id: string) => setDeleteConfirm(id)}
                submitting={submitting}
                timeAgo={timeAgo}
                getInitial={getInitial}
                getName={getName}
                adjustHeight={adjustHeight}
                handleKeyDown={handleKeyDown}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

function CommentItem({ 
  comment, 
  replies, 
  session, 
  replyingTo, 
  replyContent, 
  setReplyContent, 
  onReply, 
  onSubmitReply, 
  onDelete, 
  submitting, 
  timeAgo, 
  getInitial, 
  getName,
  adjustHeight,
  handleKeyDown
}: any) {
  const isOwner = session?.user?.id === comment.user_id;
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow inline reply textarea
  useEffect(() => {
    if (replyTextareaRef.current) {
      adjustHeight(replyTextareaRef.current);
    }
  }, [replyContent]);

  return (
    <div className="animate-in fade-in duration-300 text-left">
      <div className="flex gap-2.5 items-start">
        {/* Compact Circular Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-850 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
          {getInitial(comment)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Grouped bubble layout: Facebook style */}
          <div className="flex flex-col items-start">
            <div className="inline-block bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-800/40 rounded-xl p-2.5 px-3.5 max-w-[90%] text-left">
              <span className="block font-bold text-slate-900 dark:text-white text-xs hover:underline cursor-pointer mb-0.5">
                {getName(comment)}
              </span>
              <RichTextDisplay 
                className="text-slate-700 dark:text-slate-200 text-[13px] leading-relaxed font-normal whitespace-pre-line break-words"
                content={comment.content} 
              />
            </div>
          </div>

          {/* Minimal Action Links (Dot separated) */}
          <div className="flex items-center gap-2 px-3 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
            <button
              onClick={() => onReply(replyingTo === comment.id ? null : comment.id)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-semibold"
            >
              Reply
            </button>
            <span>•</span>
            {isOwner && (
              <>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="hover:text-red-500 transition-colors font-semibold"
                >
                  Delete
                </button>
                <span>•</span>
              </>
            )}
            <span className="font-normal">{timeAgo(comment.created_at)}</span>
          </div>

          {/* Compact Reply Input */}
          {replyingTo === comment.id && session && (
            <div className="mt-3 pl-3 border-l-2 border-slate-200 dark:border-slate-800 animate-in slide-in-from-left-4 duration-300">
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-bold text-indigo-500 text-xs shrink-0">
                  {session.user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 px-3 focus-within:border-indigo-500 transition-all">
                    <textarea
                      ref={replyTextareaRef}
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Reply to ${getName(comment)}...`}
                      rows={1}
                      autoFocus
                      className="w-full bg-transparent outline-none resize-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-xs py-1 transition-all"
                    />
                  </div>
                  <div className="flex justify-end gap-2 text-xs">
                    <button 
                      onClick={() => onReply(null)} 
                      className="px-3 py-1 font-semibold text-slate-450 hover:text-slate-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => onSubmitReply(comment.id, replyContent)}
                      disabled={submitting || !replyContent.trim()}
                      className="px-4 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Premium Nested Replies */}
          {replies?.length > 0 && (
            <div className="mt-3.5 space-y-3 pl-2">
              {replies.map((reply: any) => {
                const isReplyOwner = session?.user?.id === reply.user_id;
                return (
                  <div key={reply.id} className="relative flex gap-2.5 items-start pl-4">
                    {/* Visual connection line */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800/60 rounded-full" />
                    
                    {/* Sub-reply circular avatar */}
                    <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center font-bold text-slate-500 text-[10px] shrink-0">
                      {getInitial(reply)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Sub-reply text bubble */}
                      <div className="flex flex-col items-start">
                        <div className="inline-block bg-slate-50 dark:bg-slate-800/60 border border-transparent dark:border-slate-800/20 rounded-xl p-2 px-3 max-w-[90%] text-left">
                          <span className="block font-bold text-slate-900 dark:text-white text-[11px] hover:underline cursor-pointer mb-0.5">
                            {getName(reply)}
                          </span>
                          <div className="text-slate-700 dark:text-slate-200 text-[13px] leading-relaxed font-normal whitespace-pre-line break-words">
                            <span className="text-indigo-600 dark:text-indigo-450 text-xs font-semibold mr-1.5">@{getName(comment)}</span>
                            <RichTextDisplay content={reply.content} className="inline" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Sub-reply Action Row */}
                      <div className="flex items-center gap-2 px-2 mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {isReplyOwner && (
                          <>
                            <button
                              onClick={() => onDelete(reply.id)}
                              className="hover:text-red-500 transition-colors font-semibold"
                            >
                              Delete
                            </button>
                            <span>•</span>
                          </>
                        )}
                        <span className="font-normal">{timeAgo(reply.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
