"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MessageSquare, Trash2, Edit2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DiscussionProps {
  itemType: string;
  itemId: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: UserProfile;
}

export default function Discussion({ itemType, itemId }: DiscussionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [session, setSession] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles(id, full_name, avatar_url)
        `)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchComments();
    }
  }, [itemId]);

  const handleSubmit = async (parentId: string | null = null, content: string) => {
    if (!session) {
      toast.error('You must be logged in to comment');
      return;
    }
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            item_type: itemType,
            item_id: itemId,
            content: content.trim(),
            parent_id: parentId,
            user_id: session.user.id
          }
        ])
        .select(`
           *,
           profiles(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      toast.success('Comment posted successfully');
      setNewComment("");
      setReplyContent("");
      setReplyingTo(null);
      setComments([...comments, data]);
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error(error.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      setComments(comments.filter(c => c.id !== commentId && c.parent_id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  // Group comments
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="mt-12 bg-gray-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Discussion</h3>
        <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-3 py-1 rounded-full">{comments.length}</span>
      </div>

      {/* Comment Input */}
      {session ? (
        <div className="mb-10 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-300 transition-all">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts with the community..."
            className="w-full bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[80px]"
          />
          <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Logged in as {session.user.email}</div>
            <button
              onClick={() => handleSubmit(null, newComment)}
              disabled={submitting || !newComment.trim()}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/25 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Post Comment
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-10 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 flex items-center justify-between">
          <div className="flex items-center gap-4 text-indigo-800 dark:text-indigo-200">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-bold text-sm">Want to join the discussion? Log in to leave a comment!</p>
          </div>
          <a href="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition">Log In</a>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : rootComments.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-bold">No comments yet. Be the first to start the discussion!</p>
          </div>
        ) : (
          rootComments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              replies={getReplies(comment.id)} 
              session={session}
              onReply={(id: string | null) => setReplyingTo(id)}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={(parentId: string, content: string) => handleSubmit(parentId, content)}
              onDelete={handleDelete}
              submitting={submitting}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, replies, session, onReply, replyingTo, replyContent, setReplyContent, onSubmitReply, onDelete, submitting }: any) {
  const isOwner = session?.user?.id === comment.user_id;

  return (
    <div className="flex gap-4 group">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 border-2 border-white dark:border-slate-800 shadow-sm">
        {comment.profiles?.avatar_url ? (
          <img src={comment.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 dark:text-slate-300 uppercase text-lg">
            {comment.profiles?.full_name?.charAt(0) || 'U'}
          </div>
        )}
      </div>
      <div className="flex-1 w-full min-w-0">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700 shadow-sm relative">
          <div className="flex items-center justify-between mb-3 border-b border-slate-50 dark:border-slate-700/50 pb-2">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{comment.profiles?.full_name || 'Unknown User'}</h4>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-md">
              {new Date(comment.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>
          
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/50">
            <button 
              onClick={() => {
                onReply(replyingTo === comment.id ? null : comment.id);
                setReplyContent("");
              }} 
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg"
            >
              💬 Reply
            </button>
            {isOwner && (
              <button 
                onClick={() => onDelete(comment.id)} 
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-900 px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Delete comment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Reply Box */}
        {replyingTo === comment.id && session && (
          <div className="mt-4 animate-in slide-in-from-top-2">
            <div className="bg-indigo-50/50 dark:bg-slate-800/80 p-4 rounded-2xl border border-indigo-100 dark:border-slate-700 shadow-inner relative before:absolute before:-top-2 before:left-6 before:w-4 before:h-4 before:bg-indigo-50/50 dark:before:bg-slate-800/80 before:border-t before:border-l before:border-indigo-100 dark:before:border-slate-700 before:rotate-45">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Replying to ${comment.profiles?.full_name}...`}
                className="w-full bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm min-h-[60px]"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-indigo-100/50 dark:border-slate-700">
                <button onClick={() => onReply(null)} className="px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition">Cancel</button>
                <button
                  onClick={() => onSubmitReply(comment.id, replyContent)}
                  disabled={submitting || !replyContent.trim()}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md disabled:opacity-50 hover:bg-indigo-700 transition"
                >
                  Send Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {replies?.length > 0 && (
          <div className="mt-4 space-y-4 pl-6 relative before:absolute before:left-0 before:top-2 before:w-px before:h-[calc(100%-2rem)] before:bg-slate-200 dark:before:bg-slate-700">
            {replies.map((reply: any) => (
              <div key={reply.id} className="relative before:absolute before:-left-6 before:top-6 before:w-6 before:h-px before:bg-slate-200 dark:before:bg-slate-700">
                <CommentItem 
                  comment={reply} 
                  replies={[]} 
                  session={session}
                  onReply={onReply}
                  replyingTo={replyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onSubmitReply={onSubmitReply}
                  onDelete={onDelete}
                  submitting={submitting}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
