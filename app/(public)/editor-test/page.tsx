"use client";

import React, { useState } from 'react';
import NextPrepEditor from '@/components/editor/NextPrepEditor';
import RichTextDisplay from '@/components/shared/RichTextDisplay';
import RichTextEditor from '@/components/shared/RichTextEditor';
import { Sparkles, Edit, Eye, Code, Layers, X, Save } from 'lucide-react';

export default function EditorTestPage() {
  const [content, setContent] = useState('<p>Welcome to the <strong>NextPrepBD Custom Editor</strong> test page!</p><p style="font-family: \'Times New Roman\', Times, serif;">This paragraph is styled with <strong>Times New Roman</strong> font!</p><p>Try searching for Google Fonts like <strong>Outfit</strong>, <strong>Roboto</strong>, or <strong>Hind Siliguri</strong> using <em>+ Add Google Font...</em> in the toolbar!</p>');
  const [activeTab, setActiveTab] = useState<'editor' | 'modal' | 'preview' | 'raw'>('editor');
  
  // Modal sandbox states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Sample Lesson Plan Passage');
  const [modalBody, setModalBody] = useState(content);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Live Test Page
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Editor & Lesson Plan Sandbox</h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Test editor popup modal, Times New Roman, and dynamic Google Fonts search on localhost</p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
          >
            <Layers className="w-4 h-4" /> Open Editor Popup Modal
          </button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'editor' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <Edit className="w-4 h-4" /> Standalone Editor
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'preview' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-4 h-4" /> Student View (MathJax + Fonts)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'raw' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            <Code className="w-4 h-4" /> Raw HTML Output
          </button>
        </div>

        {/* Tab Displays */}
        <div className="mt-6">
          {activeTab === 'editor' && (
            <div className="bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <NextPrepEditor 
                initialValue={content} 
                onChange={setContent} 
              />
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-[450px]">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Student Live Render View</h3>
              <RichTextDisplay content={content} />
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="p-6 bg-slate-900 rounded-3xl shadow-md border border-slate-800 overflow-hidden">
              <pre className="text-emerald-400 p-2 overflow-x-auto text-xs whitespace-pre-wrap font-mono leading-relaxed">
                {content}
              </pre>
            </div>
          )}
        </div>

      </div>

      {/* Editor Modal Popup Simulation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[85vh] overflow-hidden">
            
            <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Lesson Plan Editor Popup Test</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Component Content</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setContent(modalBody); setIsModalOpen(false); }} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Title</label>
                  <input 
                    type="text" 
                    value={modalTitle} 
                    onChange={(e) => setModalTitle(e.target.value)} 
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Rich Text Editor (Typing/formatting inside modal will NOT close popup)</label>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <RichTextEditor 
                      initialValue={modalBody} 
                      onChange={setModalBody} 
                    />
                  </div>
                </div>

              </div>

              <div className="px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
                <span className="text-xs text-slate-400 font-medium">Verify typing and formatting keep popup open</span>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-1.5">
                    <Save className="w-4 h-4" /> Save Component
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
