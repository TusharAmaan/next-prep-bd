"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MessageSquare, Trash2, Send, CornerDownRight, Loader2, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from './ConfirmModal';
import renderMathInElement from "katex/dist/contrib/auto-render";
import "katex/dist/katex.min.css";
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

  // Dynamically trigger KaTeX math rendering whenever comments list or replying state updates
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
  }, [comments, replyingTo, loading]);

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
    if (!session) { toast.error(capitalizeEachWord('you must be logged in to comment')); return; }
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ item_type: itemType, item_id: itemId, content: content.trim(), parent_id: parentId, user_id: session.user.id }])
        .select(`id, content, created_at, user_id, parent_id, profiles:user_id(id, full_name)`)
        .single();

      if (error) throw error;
      toast.success(capitalizeEachWord('comment posted!'));
      setNewComment(""); setReplyContent(""); setReplyingTo(null);
      setComments(prev => [...prev, normalizeComment(data)]);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error(error.message || capitalizeEachWord('failed to post comment'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId));
      toast.success(capitalizeEachWord('comment deleted'));
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(capitalizeEachWord('failed to delete comment'));
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
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-600/10 dark:bg-indigo-400/10 border border-indigo-500/20 rounded-full">
          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            {rootComments.length} {capitalizeEachWord(rootComments.length === 1 ? 'response' : 'responses')}
          </span>
        </div>
        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800/50" />
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          <span>{capitalizeEachWord('sort:')}</span>
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="bg-transparent border-none outline-none cursor-pointer text-slate-650 dark:text-slate-350 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <option value="newest" className="dark:bg-slate-900">{capitalizeEachWord('newest')}</option>
            <option value="oldest" className="dark:bg-slate-900">{capitalizeEachWord('oldest')}</option>
          </select>
        </div>
      </div>

      {/* --- SLEEK INPUT AREA --- */}
      {session ? (
        <div className="mb-6">
          <div className="flex gap-3">
            {/* Circular Avatar */}
            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center font-black text-sm shrink-0 shadow-sm border border-indigo-100 dark:border-indigo-800">
              {session.user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 space-y-2">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all duration-300">
                <textarea
                  ref={mainTextareaRef}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={capitalizeEachWord(`comment as ${session.user.email?.split('@')[0] || 'user'}...`)}
                  rows={1}
                  className="w-full bg-transparent outline-none resize-none text-sm p-3.5 pb-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 placeholder:font-medium leading-relaxed transition-all"
                />
                
                <div className={`flex justify-end p-3 pt-0 transition-all duration-300 transform ${newComment.trim() ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 h-0 overflow-hidden'}`}>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setNewComment("")}
                      className="px-4 py-1.5 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {capitalizeEachWord('cancel')}
                    </button>
                    <button
                      onClick={() => handleSubmit(null, newComment)}
                      disabled={submitting || !newComment.trim()}
                      className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : capitalizeEachWord('send')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative p-6 md:p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 rounded-[2rem] text-center overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
            
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              {capitalizeEachWord('join the discussion')}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6 max-w-xs mx-auto leading-relaxed">
              {capitalizeEachWord('sign in to share your insights, ask questions, and collaborate with the community.')}
            </p>
            
            <a 
              href="/login" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95"
            >
              {capitalizeEachWord('sign in now')}
            </a>
          </div>
        </div>
      )}

      {/* --- COMMENTS LIST --- */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
              {capitalizeEachWord('retrieving dialogues...')}
            </span>
          </div>
        ) : sortedRoots.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center group">
            <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform duration-500">
              <MessageSquare className="w-5 h-5 text-slate-200 dark:text-slate-800" />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest leading-relaxed">
              {capitalizeEachWord('no shared perspectives yet.')} <br/> 
              {capitalizeEachWord('be the first to spark the discussion.')}
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
        title={capitalizeEachWord('remove comment')}
        message={capitalizeEachWord('this action cannot be undone. are you sure you want to remove this perspective?')}
        confirmText={capitalizeEachWord('confirm removal')}
        cancelText={capitalizeEachWord('keep comment')}
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
    <div className="animate-in fade-in duration-500 text-left">
      <div className="flex gap-2.5 items-start">
        {/* Compact Circular Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-slate-400 text-[10px] shrink-0">
          {getInitial(comment)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Grouped bubble layout: Facebook style */}
          <div className="flex flex-col items-start">
            <div className="inline-block bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-800/40 rounded-2xl p-2.5 px-4 max-w-[90%] text-left">
              <span className="block font-extrabold text-slate-900 dark:text-white text-xs hover:underline cursor-pointer mb-0.5">
                {capitalizeEachWord(getName(comment))}
              </span>
              <p className="text-slate-700 dark:text-slate-250 text-[13px] leading-relaxed font-normal whitespace-pre-line break-words">
                {comment.content}
              </p>
            </div>
          </div>

          {/* Minimal Action Links (Dot separated) */}
          <div className="flex items-center gap-2 px-3 mt-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
            <button
              onClick={() => onReply(replyingTo === comment.id ? null : comment.id)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              {capitalizeEachWord('reply')}
            </button>
            <span>•</span>
            {isOwner && (
              <>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="hover:text-red-500 transition-colors"
                >
                  {capitalizeEachWord('delete')}
                </button>
                <span>•</span>
              </>
            )}
            <span className="font-medium">{capitalizeEachWord(timeAgo(comment.created_at))}</span>
          </div>

          {/* Compact Reply Input */}
          {replyingTo === comment.id && session && (
            <div className="mt-3 pl-3 border-l-2 border-slate-200 dark:border-slate-800 animate-in slide-in-from-left-4 duration-500">
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-black text-indigo-500 text-[10px] shrink-0">
                  {session.user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 px-3 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
                    <textarea
                      ref={replyTextareaRef}
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={capitalizeEachWord(`reply to ${getName(comment)}...`)}
                      rows={1}
                      autoFocus
                      className="w-full bg-transparent outline-none resize-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-xs py-1 transition-all"
                    />
                  </div>
                  <div className="flex justify-end gap-2 text-[10px]">
                    <button 
                      onClick={() => onReply(null)} 
                      className="px-3 py-1 font-black uppercase text-slate-400 hover:text-slate-655 transition-colors"
                    >
                      {capitalizeEachWord('cancel')}
                    </button>
                    <button
                      onClick={() => onSubmitReply(comment.id, replyContent)}
                      disabled={submitting || !replyContent.trim()}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : capitalizeEachWord('send')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Premium Nested Replies */}
          {replies?.length > 0 && (
            <div className="mt-3.5 space-y-3.5 pl-2">
              {replies.map((reply: any) => {
                const isReplyOwner = session?.user?.id === reply.user_id;
                return (
                  <div key={reply.id} className="relative flex gap-2.5 items-start pl-4">
                    {/* Visual connection line */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800/60 rounded-full" />
                    
                    {/* Sub-reply circular avatar */}
                    <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-150 dark:border-slate-700 flex items-center justify-center font-black text-slate-450 text-[9px] shrink-0">
                      {getInitial(reply)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Sub-reply text bubble */}
                      <div className="flex flex-col items-start">
                        <div className="inline-block bg-slate-100/70 dark:bg-slate-800/65 border border-transparent dark:border-slate-800/30 rounded-2xl p-2 px-3.5 max-w-[90%] text-left">
                          <span className="block font-black text-slate-900 dark:text-white text-[11px] hover:underline cursor-pointer mb-0.5">
                            {capitalizeEachWord(getName(reply))}
                          </span>
                          <p className="text-slate-700 dark:text-slate-250 text-[13px] leading-relaxed font-normal whitespace-pre-line break-words">
                            <span className="text-indigo-500 text-[10px] font-black uppercase mr-1.5 opacity-60">@{capitalizeEachWord(getName(comment))}</span>
                            {reply.content}
                          </p>
                        </div>
                      </div>
                      
                      {/* Sub-reply Action Row */}
                      <div className="flex items-center gap-2 px-2 mt-1 text-[9px] font-bold text-slate-400 dark:text-slate-500">
                        {isReplyOwner && (
                          <>
                            <button
                              onClick={() => onDelete(reply.id)}
                              className="hover:text-red-500 transition-colors"
                            >
                              {capitalizeEachWord('delete')}
                            </button>
                            <span>•</span>
                          </>
                        )}
                        <span className="font-medium">{capitalizeEachWord(timeAgo(reply.created_at))}</span>
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
