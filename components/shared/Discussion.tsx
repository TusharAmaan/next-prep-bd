"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MessageSquare, Trash2, AlertCircle, Loader2, Send, CornerDownRight } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from './ConfirmModal';

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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

      toast.success('Posted successfully!');
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
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      setComments(comments.filter(c => c.id !== commentId && c.parent_id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Group comments
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  return (
    <div className="mt-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-1 md:p-14 rounded-[4rem] border border-slate-200/60 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden transition-all duration-500">
      {/* PREMIUM DECORATION */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-5 mb-14">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-slide-in-left">
              <MessageSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="animate-slide-in-bottom">
            <h3 className="text-4xl font-black text-slate-950 dark:text-white items-baseline flex gap-2 tracking-tight italic">
              DISCUSSION <span className="text-indigo-600 dark:text-indigo-400 not-italic grow-0">HUB</span>
            </h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-1 ml-1 opacity-60">Verified Exchange Program</p>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-indigo-50 dark:bg-slate-800/80 px-5 py-2.5 rounded-full border border-indigo-100 dark:border-slate-700 shadow-sm animate-fade-in group">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{comments.length} <span className="text-slate-400">THREADS</span></span>
          </div>
        </div>

        {/* Comment Input */}
        {session ? (
          <div className="mb-12 group bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-300">
            <div className="flex gap-4 items-start mb-4">
               <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 text-sm border border-white dark:border-slate-600 shadow-inner">
                 {session.user.email?.charAt(0).toUpperCase()}
               </div>
               <div className="flex-1">
                 <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your insights..."
                  className="w-full bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium text-lg min-h-[100px]"
                />
               </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-slate-50 dark:border-slate-700/50">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">Verified Identity Active</div>
              <button
                onClick={() => handleSubmit(null, newComment)}
                disabled={submitting || !newComment.trim()}
                className="bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/30 active:scale-95 disabled:opacity-30 transition-all flex items-center gap-3"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post Analysis
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-12 p-8 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900/50 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/20 shadow-xl shadow-indigo-500/5 flex flex-col md:flex-row items-center gap-6 justify-between group">
            <div className="flex items-center gap-6 text-center md:text-left">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-indigo-50 dark:border-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <AlertCircle className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
              <div>
                <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xl italic leading-tight mb-1">Join the community</p>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Authentication required to leave feedback.</p>
              </div>
            </div>
            <a href="/login" className="whitespace-nowrap bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg border border-indigo-50 dark:border-slate-600 hover:bg-indigo-600 hover:text-white transition-all active:scale-95">Authenticate Now</a>
          </div>
        )}

        {/* Comment List */}
        <div className="space-y-10 relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-xl" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Fetching Discussion</span>
            </div>
          ) : rootComments.length === 0 ? (
            <div className="text-center py-20 bg-white/50 dark:bg-slate-800/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700/50 group">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-slate-100 dark:border-slate-700 group-hover:rotate-12 transition-transform duration-500">
                <MessageSquare className="w-8 h-8 text-slate-200 dark:text-slate-600 shadow-sm" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs">Knowledge Gap Detected</p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 font-medium italic">Be the FIRST to initiate the analysis loop.</p>
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
                onDelete={(id: string) => setDeleteConfirm(id)}
                submitting={submitting}
              />
            ))
          )}
        </div>
      </div>
      
      <ConfirmModal 
        isOpen={!!deleteConfirm}
        title="Delete Insight"
        message="This comment and all nested replies will be permanently erased. Proceed?"
        confirmText="Confirm Delete"
        cancelText="Keep Comment"
        isDangerous={true}
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

function CommentItem({ comment, replies, session, onReply, replyingTo, replyContent, setReplyContent, onSubmitReply, onDelete, submitting }: any) {
  const isOwner = session?.user?.id === comment.user_id;

  return (
    <div className="flex gap-6 group relative">
      <div className="w-14 h-14 rounded-3xl overflow-hidden bg-white dark:bg-slate-800 shrink-0 border-4 border-white dark:border-slate-700 shadow-xl transition-transform duration-500 group-hover:scale-105 z-10">
        {comment.profiles?.avatar_url ? (
          <img src={comment.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 uppercase md:text-xl italic">
            {comment.profiles?.full_name?.charAt(0) || 'U'}
          </div>
        )}
      </div>

      <div className="flex-1 w-full min-w-0">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-xl shadow-indigo-500/5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500">
          <div className="flex items-center justify-between mb-5 border-b border-slate-50 dark:border-slate-700/50 pb-4">
            <div>
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight italic text-lg">{comment.profiles?.full_name || 'Anonymous Contributor'}</h4>
              <p className="text-[8px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.3em] mt-0.5">Verified Intelligence</p>
            </div>
            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 opacity-60">
              {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-base whitespace-pre-wrap leading-relaxed font-medium">{comment.content}</p>
          
          <div className="flex items-center gap-4 mt-8 pt-4 border-t border-slate-50 dark:border-slate-700/30">
            <button 
              onClick={() => {
                onReply(replyingTo === comment.id ? null : comment.id);
                setReplyContent("");
              }} 
              className={`text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 
                ${replyingTo === comment.id 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600'}`}
            >
              <Send className="w-3.5 h-3.5" />
              Reply
            </button>
            {isOwner && (
              <button 
                onClick={() => onDelete(comment.id)} 
                className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-rose-500 transition-colors px-3 py-2.5 rounded-xl opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Reply Box */}
        {replyingTo === comment.id && session && (
          <div className="mt-4 animate-slide-in-top">
            <div className="bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-800 dark:to-slate-900/50 p-6 rounded-[2rem] border-2 border-indigo-100 dark:border-slate-700 shadow-2xl relative">
              <div className="flex gap-3 items-center mb-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                <CornerDownRight className="w-3.5 h-3.5" />
                Drafting Response to {comment.profiles?.full_name}
              </div>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Compose your response..."
                className="w-full bg-transparent border-none outline-none resize-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm min-h-[80px] font-medium"
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-indigo-100/50 dark:border-slate-700">
                <button onClick={() => onReply(null)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition">Dismiss</button>
                <button
                  onClick={() => onSubmitReply(comment.id, replyContent)}
                  disabled={submitting || !replyContent.trim()}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 disabled:opacity-30 hover:bg-slate-900 transition-all flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Submit Response
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {replies?.length > 0 && (
          <div className="mt-8 space-y-8 pl-10 md:pl-16 relative">
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-100 via-slate-50 to-transparent dark:from-slate-700 dark:via-slate-800 dark:to-transparent rounded-full opacity-50" />
            {replies.map((reply: any) => (
              <div key={reply.id} className="relative before:absolute before:-left-10 before:top-10 before:w-10 before:h-1 before:bg-indigo-50 dark:before:bg-slate-800 before:rounded-full">
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
