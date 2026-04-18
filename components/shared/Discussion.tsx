"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MessageSquare, Trash2, Send, CornerDownRight, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from './ConfirmModal';

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
  users: { id: string; full_name: string } | null;
}

// Normalize Supabase join result (can be array or object)
function normalizeComment(raw: any): Comment {
  let users = raw.users;
  if (Array.isArray(users)) users = users[0] || null;
  return { ...raw, users };
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
          users:user_id(id, full_name)
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

  const handleSubmit = async (parentId: string | null = null, content: string) => {
    if (!session) { toast.error('You must be logged in to comment'); return; }
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ item_type: itemType, item_id: itemId, content: content.trim(), parent_id: parentId, user_id: session.user.id }])
        .select(`id, content, created_at, user_id, parent_id, users:user_id(id, full_name)`)
        .single();

      if (error) throw error;
      toast.success('Comment posted!');
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
    const name = comment.users?.full_name || comment.users?.[0]?.full_name || 'U';
    return name.charAt(0).toUpperCase();
  };

  const getName = (comment: Comment | any) => {
    return comment.users?.full_name || comment.users?.[0]?.full_name || 'Anonymous';
  };

  return (
    <div className="w-full">
      {/* --- COMPACT HEADER --- */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/50 transition-colors">
        <div className="flex items-center gap-2">
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{rootComments.length}</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Responses</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 dark:text-slate-500">
           <span>Sort:</span>
           <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="bg-transparent border-none outline-none cursor-pointer text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* --- SLEEK INPUT AREA --- */}
      {session ? (
        <div className="mb-8">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 flex items-center justify-center font-black text-xs shrink-0 shadow-sm border border-indigo-100 dark:border-indigo-800">
              {session.user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 space-y-2">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all duration-300">
                <textarea
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Ask a question or share thoughts..."
                  rows={newComment.trim() ? 2 : 1}
                  className="w-full bg-transparent outline-none resize-none text-sm p-3.5 pb-2 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 placeholder:font-medium leading-relaxed transition-all"
                />
                
                <div className={`flex justify-end p-3 pt-0 transition-all duration-300 transform ${newComment.trim() ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 h-0 overflow-hidden'}`}>
                    <div className="flex gap-2">
                        <button
                          onClick={() => setNewComment("")}
                          className="px-4 py-1.5 text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSubmit(null, newComment)}
                          disabled={submitting || !newComment.trim()}
                          className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Publish'}
                        </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-10 p-8 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5rem] border border-indigo-100/50 dark:border-indigo-800/30 text-center transition-all">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-5">Join the conversation to help others grow.</p>
          <a href="/login" className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-indigo-600/20">
            Sign In Now <CornerDownRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* --- COMMENTS LIST --- */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <div className="relative">
                <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
            </div>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Retrieving Dialogues...</span>
          </div>
        ) : sortedRoots.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center group">
            <div className="w-16 h-16 rounded-[2rem] bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform duration-500">
                <MessageSquare className="w-6 h-6 text-slate-200 dark:text-slate-800" />
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest leading-relaxed">No shared perspectives yet. <br/> Be the first to spark the discussion.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
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
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Remove Comment"
        message="This action cannot be undone. Are you sure you want to remove this perspective?"
        confirmText="Confirm Removal"
        cancelText="Keep Comment"
        isDangerous={true}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

function CommentItem({ comment, replies, session, replyingTo, replyContent, setReplyContent, onReply, onSubmitReply, onDelete, submitting, timeAgo, getInitial, getName }: any) {
  const isOwner = session?.user?.id === comment.user_id;

  return (
    <div className="py-6 animate-in fade-in duration-500">
      <div className="flex gap-3">
        {/* Compact Avatar */}
        <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-center font-black text-slate-400 text-[10px] shrink-0">
          {getInitial(comment)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Metadata */}
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="font-bold text-slate-900 dark:text-white text-xs tracking-tight">{getName(comment)}</span>
            <div className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{timeAgo(comment.created_at)}</span>
          </div>

          {/* Content */}
          <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl p-4 mb-3 border border-transparent hover:border-slate-100 dark:hover:border-slate-800/60 transition-all group">
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                {comment.content}
            </p>
          </div>

          {/* Minimal Actions */}
          <div className="flex items-center gap-5 px-1">
            <button
              onClick={() => onReply(replyingTo === comment.id ? null : comment.id)}
              className="group flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <CornerDownRight className={`w-3 h-3 transition-transform duration-300 ${replyingTo === comment.id ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              Reply
            </button>
            {isOwner && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            )}
          </div>

          {/* Compact Reply Input */}
          {replyingTo === comment.id && session && (
            <div className="mt-6 pl-4 border-l-2 border-indigo-500/20 animate-in slide-in-from-left-4 duration-500">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center font-black text-indigo-500 text-[10px] shrink-0">
                    {session.user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 focus-within:border-indigo-500 shadow-sm transition-all">
                        <textarea
                          value={replyContent}
                          onChange={e => setReplyContent(e.target.value)}
                          placeholder={`Reply to ${getName(comment)}...`}
                          rows={2}
                          autoFocus
                          className="w-full bg-transparent outline-none resize-none text-slate-700 dark:text-slate-200 placeholder:text-slate-400 text-sm py-1 transition-all"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => onReply(null)} className="px-4 py-1.5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">
                        Cancel
                      </button>
                      <button
                        onClick={() => onSubmitReply(comment.id, replyContent)}
                        disabled={submitting || !replyContent.trim()}
                        className="px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                      >
                        {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
                      </button>
                    </div>
                  </div>
                </div>
            </div>
          )}

          {/* Premium Nested Replies */}
          {replies?.length > 0 && (
            <div className="mt-6 space-y-6 pt-6 border-t border-slate-50 dark:border-slate-800/50">
              {replies.map((reply: any) => (
                <div key={reply.id} className="pl-6 md:pl-10 relative">
                  {/* Decorative line */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-black text-slate-400 text-[10px] shrink-0">
                      {getInitial(reply)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-black text-slate-900 dark:text-white text-[11px] uppercase tracking-tight">{getName(reply)}</span>
                        <div className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{timeAgo(reply.created_at)}</span>
                      </div>
                      
                      <div className="bg-slate-50/50 dark:bg-slate-800/10 rounded-2xl p-4 border border-transparent hover:border-slate-50 dark:hover:border-slate-800/40 transition-all">
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                            <span className="text-indigo-500 text-[10px] font-black uppercase mr-2 opacity-60">@{getName(comment)}</span>
                            {reply.content}
                        </p>
                      </div>

                      {session?.user?.id === reply.user_id && (
                        <div className="flex justify-end mt-2 px-1">
                            <button
                                onClick={() => onDelete(reply.id)}
                                className="text-[9px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
