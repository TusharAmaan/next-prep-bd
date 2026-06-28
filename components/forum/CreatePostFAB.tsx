'use client';

import React, { useState } from 'react';
import { PenTool, X, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function CreatePostFAB({ 
  segments, groups, subjects, user 
}: { 
  segments: any[], groups: any[], subjects: any[], user: any 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    thread_type: 'standard',
    segment_id: '',
    difficulty: 'medium',
  });
  
  const router = useRouter();

  if (!user) return null; // Only logged in users can see the FAB

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('Title and content are required.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('forum_threads').insert({
      title: formData.title,
      content: formData.content,
      author_id: user.id,
      thread_type: formData.thread_type,
      difficulty: formData.difficulty,
      segment_id: formData.segment_id ? parseInt(formData.segment_id) : null,
      status: 'pending' // As requested, post goes to pending
    });

    setIsSubmitting(false);

    if (error) {
      alert('Failed to submit post: ' + error.message);
    } else {
      alert('Your post has been submitted and is pending admin approval.');
      setIsOpen(false);
      setFormData({ title: '', content: '', thread_type: 'standard', segment_id: '', difficulty: 'medium' });
      router.refresh();
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(79,70,229,0.4)] hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all z-40 group"
        title="Create a new post"
      >
        <PenTool className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Post</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 p-4 rounded-xl text-sm font-medium mb-6">
                <strong>Note:</strong> All new posts are reviewed by our moderation team before they appear publicly on the forum.
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="E.g., Need help with HSC Physics Vector Math"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Content</label>
                  <textarea 
                    value={formData.content}
                    onChange={e => setFormData({...formData, content: e.target.value})}
                    placeholder="Describe your question or share your thoughts here..."
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 custom-scrollbar"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Segment / Category</label>
                    <select 
                      value={formData.segment_id}
                      onChange={e => setFormData({...formData, segment_id: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
                    >
                      <option value="">General Discussion</option>
                      {segments.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Post Type</label>
                    <select 
                      value={formData.thread_type}
                      onChange={e => setFormData({...formData, thread_type: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none"
                    >
                      <option value="standard">Standard Discussion</option>
                      <option value="question_post">Question & Answer</option>
                      <option value="study_strategy">Study Strategy</option>
                    </select>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:active:scale-100"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Post'}
                {!isSubmitting && <Upload className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
