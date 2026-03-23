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
  profiles: { id: string; full_name: string } | null;
}

// Normalize Supabase join result (can be array or object)
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
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitial = (comment: Comment) => {
    return comment.profiles?.full_name?.charAt(0)?.toUpperCase() || 'U';
  };

  const getName = (comment: Comment) => {
    return comment.profiles?.full_name || 'Anonymous';
  };

  return (
    <div className="mt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-extrabold text-gray-900 uppercase tracking-wide flex items-center gap-2">
          {rootComments.length} <span className="text-gray-500 font-bold">Comments</span>
        </h3>
        <div className="relative">
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="appearance-none text-sm font-semibold text-gray-500 bg-transparent border-none outline-none cursor-pointer pr-6"
          >
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Comment Input */}
      {session ? (
        <div className="flex gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-sm shrink-0">
            {session.user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="w-full bg-transparent border-b-2 border-gray-200 focus:border-gray-900 outline-none resize-none text-gray-800 placeholder:text-gray-400 text-[15px] py-2 transition-colors"
            />
            {newComment.trim() && (
              <div className="flex justify-end gap-3 mt-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                <button
                  onClick={() => setNewComment("")}
                  className="px-5 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors rounded-full"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmit(null, newComment)}
                  disabled={submitting}
                  className="px-6 py-2 bg-gray-200 hover:bg-blue-600 hover:text-white text-sm font-bold text-gray-700 rounded-full transition-all disabled:opacity-40"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-10 p-6 bg-gray-50 rounded-xl text-center">
          <p className="text-gray-600 font-medium mb-3">Sign in to join the discussion</p>
          <a href="/login" className="inline-block px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors">
            Sign In
          </a>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-0">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <span className="text-sm text-gray-400 font-medium">Loading comments...</span>
          </div>
        ) : sortedRoots.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No comments yet. Be the first to share your thoughts.</p>
          </div>
        ) : (
          sortedRoots.map(comment => (
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
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteConfirm}
        title="Delete Comment"
        message="Are you sure? This comment will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
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
    <div className="py-6 border-b border-gray-100 last:border-b-0">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm shrink-0 mt-0.5">
          {getInitial(comment)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name & Time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-gray-900 text-sm">{getName(comment)}</span>
            <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
          </div>

          {/* Content */}
          <p className="text-gray-700 text-[15px] leading-relaxed whitespace-pre-wrap mb-2">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onReply(replyingTo === comment.id ? null : comment.id)}
              className="text-xs font-semibold text-gray-400 hover:text-gray-700 transition-colors"
            >
              Reply
            </button>
            {isOwner && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-xs font-semibold text-gray-300 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
          </div>

          {/* Reply Input */}
          {replyingTo === comment.id && session && (
            <div className="mt-4 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs shrink-0 mt-1">
                {session.user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${getName(comment)}...`}
                  rows={2}
                  autoFocus
                  className="w-full bg-transparent border-b-2 border-gray-200 focus:border-gray-900 outline-none resize-none text-gray-800 placeholder:text-gray-400 text-sm py-2 transition-colors"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => onReply(null)} className="px-4 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 rounded-full transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={() => onSubmitReply(comment.id, replyContent)}
                    disabled={submitting || !replyContent.trim()}
                    className="px-5 py-1.5 bg-gray-200 hover:bg-blue-600 hover:text-white text-xs font-bold text-gray-700 rounded-full transition-all disabled:opacity-40"
                  >
                    {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {replies?.length > 0 && (
            <div className="mt-4 space-y-0 pl-0 md:pl-2 border-l-2 border-gray-100 ml-0">
              {replies.map((reply: any) => (
                <div key={reply.id} className="py-4 pl-4">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs shrink-0 mt-0.5">
                      {getInitial(reply)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-sm">{getName(reply)}</span>
                        {/* Show "Replying to" */}
                        <span className="text-xs text-gray-400">
                          Replying to <span className="font-semibold text-gray-500">{getName(comment)}</span>
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap mb-1">{reply.content}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{timeAgo(reply.created_at)}</span>
                        {session?.user?.id === reply.user_id && (
                          <button
                            onClick={() => onDelete(reply.id)}
                            className="text-xs font-semibold text-gray-300 hover:text-red-500 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
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
