'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  CheckCircle, XCircle, Trash2, MessageSquare, 
  User, Clock, AlertCircle, Search, Filter 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PendingManagerPreview() {
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const fetchPendingPosts = async () => {
    setIsLoading(true);
    // Note: status filter will only work if status column exists in DB.
    // If not, this query will fail or return empty. We handle gracefully.
    const { data, error } = await supabase
      .from('forum_threads')
      .select(`
        *,
        author:profiles!forum_threads_author_id_fkey(full_name, avatar_url)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setPendingPosts(data);
    }
    setIsLoading(false);
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected' | 'deleted') => {
    if (action === 'deleted') {
      const confirm = window.confirm('Are you sure you want to permanently delete this post?');
      if (!confirm) return;
      
      const { error } = await supabase.from('forum_threads').delete().eq('id', id);
      if (!error) {
        setPendingPosts(prev => prev.filter(post => post.id !== id));
      } else {
        alert('Failed to delete post: ' + error.message);
      }
    } else {
      // Update status to approved or rejected
      const { error } = await supabase
        .from('forum_threads')
        .update({ status: action })
        .eq('id', id);
        
      if (!error) {
        setPendingPosts(prev => prev.filter(post => post.id !== id));
      } else {
        alert(`Failed to mark as ${action}: ` + error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pending Approvals</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and moderate newly submitted forum posts before they go live.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search posts..." 
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading pending posts...
          </div>
        ) : pendingPosts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">All caught up!</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">There are no pending posts requiring your approval right now.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {pendingPosts.map(post => (
              <div key={post.id} className="p-6 flex flex-col lg:flex-row gap-6 items-start hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                
                {/* Post details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300">
                      <User className="w-3.5 h-3.5" />
                      {post.author?.full_name || 'Unknown User'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                    {post.thread_type && (
                      <span className="capitalize text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                        {post.thread_type.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {post.title}
                  </h4>
                  
                  <div 
                    className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                </div>
                
                {/* Action buttons */}
                <div className="flex lg:flex-col gap-2 w-full lg:w-40 shrink-0">
                  <button 
                    onClick={() => handleAction(post.id, 'approved')}
                    className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button 
                    onClick={() => handleAction(post.id, 'rejected')}
                    className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAction(post.id, 'deleted')}
                    className="flex-1 lg:w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 rounded-lg text-sm font-semibold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
