"use client";

import React, { useState } from 'react';
import NextPrepEditor from '@/components/editor/NextPrepEditor';
import RichTextDisplay from '@/components/shared/RichTextDisplay';

export default function EditorTestPage() {
  const [content, setContent] = useState('<p>Welcome to the <strong>NextPrepBD Custom Editor</strong> test page!</p><p>Try highlighting this text to see the Bubble Menu, or use the new <strong>Google Docs-style Menu Bar and Top Toolbar</strong> above to test out Format Painting, Checklists, Custom Fonts, and Headings!</p>');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'raw'>('editor');

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Editor Sandbox</h1>
          <p className="text-slate-600">You can test all formatting and MathJax features here without needing to log in.</p>
        </div>
        
        {/* Tab Controls */}
        <div className="flex space-x-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'editor' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Editor Mode
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'preview' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Live Preview (Math Rendered)
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === 'raw' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Raw HTML Code
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'editor' && (
            <NextPrepEditor 
              initialValue={content} 
              onChange={setContent} 
            />
          )}

          {activeTab === 'preview' && (
            <div className="p-8 bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px]">
              <RichTextDisplay content={content} />
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="p-6 bg-slate-900 rounded-xl shadow-sm border border-slate-800">
              <pre className="text-slate-50 p-2 overflow-x-auto text-sm whitespace-pre-wrap font-mono">
                {content}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
