"use client";

import { useState } from "react";
import { FileText, HelpCircle, Sparkles } from "lucide-react";
import SinglePostContent from "@/components/public/SinglePostContent";
import QuizView from "@/components/public/QuizView";

interface WrapperProps {
  post: any;
  questions: any[];
  formattedDate: string;
  readTime: number;
  bengaliFontClass: string;
  isLoggedIn: boolean;
}

export default function BlogContentWrapper({ 
  post, 
  questions, 
  formattedDate, 
  readTime, 
  bengaliFontClass, 
  isLoggedIn 
}: WrapperProps) {
  const [activeTab, setActiveTab] = useState<'article' | 'quiz'>('article');

  return (
    <div className="space-y-12">
      
      {/* === PREMIUM TAB SELECTOR === */}
      {questions && questions.length > 0 && (
        <div className="flex justify-center px-4 md:px-0 sticky top-24 z-30 pointer-events-none">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/50 p-1.5 flex gap-1 shadow-2xl shadow-indigo-500/10 rounded-[2rem] pointer-events-auto transition-all hover:scale-[1.02]">
            <button
              onClick={() => setActiveTab('article')}
              className={`flex items-center gap-3 px-8 py-4 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 ${
                activeTab === 'article' 
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl' 
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <FileText size={16} className={activeTab === 'article' ? "animate-pulse" : ""} /> 
              Article
            </button>
            
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-3 px-8 py-4 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all duration-500 relative ${
                activeTab === 'quiz' 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' 
                  : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'
              }`}
            >
              <HelpCircle size={16} className={activeTab === 'quiz' ? "animate-bounce" : ""} />
              Practice Lab
              <div className={`ml-1 px-2 py-0.5 rounded-full text-[9px] font-black transition-all ${
                  activeTab === 'quiz' ? 'bg-white/20 text-white scale-110' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
              }`}>
                {questions.length}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* === CONTENT CONTAINER === */}
      <main className="min-h-[600px] relative">
        
        {/* ARTICLE SECTION */}
        <div className={activeTab === 'article' ? 'block transition-all duration-700' : 'hidden'}>
           <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
              <SinglePostContent 
                post={post} 
                formattedDate={formattedDate}
                readTime={readTime}
                bengaliFontClass={bengaliFontClass} 
                isLoggedIn={isLoggedIn}
              />
           </div>
        </div>

        {/* QUIZ SECTION */}
        {activeTab === 'quiz' && (
          <div className="animate-in fade-in zoom-in-95 duration-700 ease-out">
             <div className="mb-12 text-center border-b border-slate-100 dark:border-slate-800 pb-16">
                <div className="relative inline-block mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-2xl shadow-indigo-500/40 rotate-6 animate-pulse">
                        <Sparkles size={32} />
                    </div>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter leading-tight max-w-4xl mx-auto">
                    {post.title}
                </h1>
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                    <span>Interactive Assessment Portal</span>
                    <div className="w-1 h-1 rounded-full bg-indigo-400" />
                    <span>{questions.length} Questions</span>
                </div>
             </div>
             
             <div className="max-w-5xl mx-auto">
                <QuizView 
                    questions={questions} 
                    isLoggedIn={isLoggedIn} 
                    title={post.title} 
                />
             </div>
          </div>
        )}

      </main>
    </div>
  );
}