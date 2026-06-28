'use client';

import React, { useState } from 'react';
import { Video, BookOpen, CheckCircle2, Plus, Trash2, Save, X, GripVertical } from 'lucide-react';
import RichTextEditor from '@/components/shared/RichTextEditor';

export default function ContentItemEditor({ content, onSave, onCancel }: { content: any, onSave: (id: string, updates: any) => void, onCancel: () => void }) {
    const [title, setTitle] = useState(content.title || '');
    const [contentType, setContentType] = useState(content.content_type || 'video');
    const [videoUrl, setVideoUrl] = useState(content.video_url || '');
    const [articleBody, setArticleBody] = useState(content.article_body || '');
    const [mcqs, setMcqs] = useState<any[]>(content.mcqs || []);

    const handleSave = () => {
        onSave(content.id, {
            title,
            content_type: contentType,
            video_url: videoUrl,
            article_body: articleBody,
            mcqs
        });
    };

    const addMcq = () => {
        setMcqs([...mcqs, {
            id: Date.now().toString(),
            question: '',
            options: [
                { id: '1', text: '' },
                { id: '2', text: '' },
                { id: '3', text: '' },
                { id: '4', text: '' }
            ],
            correctOptionId: '1',
            explanation: ''
        }]);
    };

    const updateMcq = (mcqId: string, updates: any) => {
        setMcqs(mcqs.map(m => m.id === mcqId ? { ...m, ...updates } : m));
    };

    const deleteMcq = (mcqId: string) => {
        setMcqs(mcqs.filter(m => m.id !== mcqId));
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-slate-800 dark:text-white">Edit Content Item</h4>
                <div className="flex gap-2">
                    <button onClick={onCancel} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                    <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-indigo-700 transition-colors">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Item Title</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Content Type */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content Type</label>
                    <div className="grid grid-cols-3 gap-4">
                        <button 
                            onClick={() => setContentType('video')}
                            className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all ${contentType === 'video' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        >
                            <Video size={24} />
                            <span className="font-semibold text-sm">Video Lesson</span>
                        </button>
                        <button 
                            onClick={() => setContentType('article')}
                            className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all ${contentType === 'article' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        >
                            <BookOpen size={24} />
                            <span className="font-semibold text-sm">Article / Reading</span>
                        </button>
                        <button 
                            onClick={() => setContentType('quiz')}
                            className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all ${contentType === 'quiz' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        >
                            <CheckCircle2 size={24} />
                            <span className="font-semibold text-sm">Quiz (MCQs)</span>
                        </button>
                    </div>
                </div>

                {/* Video specific */}
                {contentType === 'video' && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Video Embed URL (YouTube/Vimeo)</label>
                        <input 
                            type="text" 
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="https://www.youtube.com/embed/..."
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                )}

                {/* Article/Text (Always available for video or article) */}
                {(contentType === 'video' || contentType === 'article') && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {contentType === 'video' ? 'Supplementary Reading (Optional)' : 'Article Content'}
                        </label>
                        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
                            <RichTextEditor 
                                initialValue={articleBody}
                                onChange={(val) => setArticleBody(val)}
                            />
                        </div>
                    </div>
                )}

                {/* Quiz Builder */}
                {contentType === 'quiz' && (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Multiple Choice Questions</label>
                        
                        {mcqs.map((mcq, mIndex) => (
                            <div key={mcq.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 relative">
                                <button onClick={() => deleteMcq(mcq.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-2">
                                    <Trash2 size={16} />
                                </button>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Question {mIndex + 1}</label>
                                    <textarea 
                                        value={mcq.question}
                                        onChange={(e) => updateMcq(mcq.id, { question: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        rows={2}
                                        placeholder="Type your question here..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Options (Select Correct)</label>
                                    {mcq.options.map((opt: any, oIndex: number) => (
                                        <div key={opt.id} className="flex items-center gap-3">
                                            <input 
                                                type="radio" 
                                                name={`correct-${mcq.id}`} 
                                                checked={mcq.correctOptionId === opt.id}
                                                onChange={() => updateMcq(mcq.id, { correctOptionId: opt.id })}
                                                className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                            />
                                            <input 
                                                type="text" 
                                                value={opt.text}
                                                onChange={(e) => {
                                                    const newOpts = [...mcq.options];
                                                    newOpts[oIndex].text = e.target.value;
                                                    updateMcq(mcq.id, { options: newOpts });
                                                }}
                                                placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Explanation (Optional)</label>
                                    <textarea 
                                        value={mcq.explanation}
                                        onChange={(e) => updateMcq(mcq.id, { explanation: e.target.value })}
                                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        rows={2}
                                        placeholder="Explain the correct answer..."
                                    />
                                </div>
                            </div>
                        ))}

                        <button 
                            onClick={addMcq}
                            className="w-full py-4 border-2 border-dashed border-indigo-200 dark:border-indigo-900 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Add Question
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
